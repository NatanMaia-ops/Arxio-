# Deploy na AWS — diário de bordo

Registro do que realmente aconteceu ao publicar a Arxio num único serviço App
Runner: a sequência que funcionou, os quatro incidentes do caminho, a causa de
cada um e como foram diagnosticados.

O `docs/DEPLOY_AWS_PASSO_A_PASSO.md` é o tutorial — ele ensina o caminho feliz.
Este documento é o oposto: guarda o caminho torto, porque três dos quatro
incidentes **não aparecem em nenhuma mensagem de erro da AWS** e custaram mais
tempo que o deploy inteiro.

Se você está subindo pela primeira vez, leia o tutorial. Volte para cá quando
algo falhar sem explicar por quê.

---

## 1. O que ficou no ar

| Peça | Valor |
|---|---|
| URL | `https://iqbmdyxemm.us-east-1.awsapprunner.com` |
| Serviço App Runner | `arxio`, id `b362f1ac2b494cf29abf64baafa3d55d` |
| Imagem | ECR `arxio:latest`, `linux/amd64` |
| Start command | `node deploy/start.mjs` |
| Recursos | `0.5 vCPU` / `1 GB` |
| Health check | HTTP `/health` |
| Egress | VPC, connector `arxio-connector` (`.../1/dc23a871aa4948fb8650e3720b0ac956`) |
| Banco | RDS `arxio-db`, privado, TLS obrigatório |

O container roda dois processos: **Express** na porta do App Runner (3000), que
é a porta de entrada, e **Next** em `127.0.0.1:3001`, sem porta exposta. Todo
tráfego que não é de API é repassado pelo Express. O porquê dessa ordem está em
`docs/LOGIN_COOKIES_CROSS_SITE.md`.

---

## 2. A sequência que funcionou

A infraestrutura pesada — RDS, VPC connector, roles e segredos — já existia. O
que faltava era o repositório de imagem e o serviço.

```bash
# 1. Repositório da imagem
aws ecr create-repository --repository-name arxio --region us-east-1 \
  --image-scanning-configuration scanOnPush=true

# 2. Build e push (a imagem precisa existir ANTES do serviço)
REGISTRY=839922332678.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin $REGISTRY

docker build --platform linux/amd64 --provenance=false --sbom=false \
  -t $REGISTRY/arxio:latest .
docker push $REGISTRY/arxio:latest

# 3. Serviço
bash deploy/aws/create-service.sh

# 4. Depois que nascer, fechar o círculo com a URL real
PUBLIC_URL=https://SUA_URL bash deploy/aws/create-service.sh
```

As flags `--provenance=false --sbom=false` do passo 2 não são decorativas — veja
a seção 7.

Antes de criar o serviço vale conferir a infra numa passada só. Todos estes
comandos precisam responder:

```bash
aws apprunner list-vpc-connectors --region us-east-1 \
  --query "VpcConnectors[?VpcConnectorName=='arxio-connector'].[Status]" --output text
aws secretsmanager list-secrets --region us-east-1 \
  --query "SecretList[?starts_with(Name,'arxio/')].Name" --output text
aws iam list-role-policies --role-name ArxioAppRunnerInstanceRole
aws rds describe-db-instances --db-instance-identifier arxio-db --region us-east-1 \
  --query "DBInstances[0].DBInstanceStatus" --output text
```

---

## 3. Incidente 1 — `CREATE_FAILED` sem nenhum log

**Sintoma.** O serviço nascia em `CREATE_FAILED` duas vezes seguidas. O log de
serviço mostrava a imagem sendo baixada com sucesso e, 18 segundos depois, um
`Failed to deploy your application image` sem motivo.

```
19:08:45 [AppRunner] Successfully pulled your application image from ECR.
19:09:03 [AppRunner] Failed to deploy your application image.
```

O detalhe que orientou tudo: **o log group `/application` não existia**. Nem
vazio — inexistente. Um container que sobe e morre ainda escreve alguma coisa;
não escrever nada significa que ele nunca chegou a rodar.

**Causa.** O VPC connector `arxio-connector` estava com status `ACTIVE` mas
inoperante. Com egress pela VPC, o container não conseguia ser iniciado.

**Como cheguei nisso.** Por eliminação. Verifiquei e descartei, um a um:

| Suspeito | Como descartei |
|---|---|
| Imagem quebrada | rodei o container local com os mesmos limites (1 GB / 0.5 vCPU): sobe e loga em 1s |
| Manifest inválido | `ecr batch-get-image`: `manifest.v2`, 13 camadas, sem índice multi-plataforma |
| Arquitetura errada | `linux/amd64`, confirmado no config blob |
| Segredos ilegíveis | `iam simulate-principal-policy` → `allowed`; os 4 secrets bem formados |
| Roles trocadas | trust do instance role em `tasks.apprunner.amazonaws.com`, do access role em `build.` |
| Permissions boundary / SCP | nenhum |
| Service-linked roles | `AWSServiceRoleForAppRunner` e `...Networking` existem |
| Cota | quota real de 30 serviços, havia 0 |
| Subnets sem IP | 4090 livres em cada |
| AZ não suportada | `use1-az1` e `use1-az2`, ambas suportadas |
| NAT quebrado | NAT público com EIP, rota `0.0.0.0/0 → igw` na main route table |
| RDS inalcançável | mesma VPC, SG do RDS liberando 5432 vindo do SG do connector |

Com tudo descartado, fiz o **teste que fecha o diagnóstico**: subi a mesma
imagem, com os mesmos segredos, mudando **uma única variável** — o egress.

| Teste | Egress | Resultado |
|---|---|---|
| A | VPC (connector antigo) | `CREATE_FAILED`, zero logs |
| B | DEFAULT (sem VPC) | `RUNNING`, com logs |

**Correção.** Apagar e recriar o connector. Ele é imutável, então não dá para
consertar — e a AWS recusa criar um segundo com a mesma combinação de security
group, o que obriga a apagar o antigo primeiro:

```bash
aws apprunner delete-vpc-connector --region us-east-1 --vpc-connector-arn "ARN_ANTIGO"

aws apprunner create-vpc-connector --region us-east-1 \
  --vpc-connector-name arxio-connector \
  --subnets subnet-01c5779c2f056026e subnet-0f2427f301767cf5f \
  --security-groups sg-08e29b2e607726dc1
```

Mesmas subnets, mesmo security group. Só o ARN mudou — e o container passou a
iniciar. Apagar o connector **não** invalida a regra do security group do RDS,
porque ela referencia o SG (`sg-08e29b2e607726dc1`), que é um recurso do EC2 e
sobrevive.

> **Honestidade sobre a causa.** A AWS nunca emitiu mensagem explicando o que
> havia de errado com o connector. A conclusão é empírica: mesma imagem sem VPC
> sobe, com VPC não sobe, e depois de recriar o connector com configuração
> idêntica passa a subir. É forte o bastante para agir, mas não é uma mensagem
> de erro — se acontecer de novo, o teste A/B acima é o caminho mais rápido.

**Lição.** `/application` inexistente é o sinal mais informativo que o App
Runner dá. Ele separa "o container morreu" de "o container nunca nasceu", e essa
distinção elimina metade dos suspeitos de uma vez:

```bash
aws logs describe-log-groups --region us-east-1 \
  --log-group-name-prefix "/aws/apprunner/arxio/" \
  --query "logGroups[].logGroupName" --output text
```

---

## 4. Incidente 2 — health check falhando por 19 minutos

**Sintoma.** Depois de recriar o connector, o deploy ficou 19 minutos em
`OPERATION_IN_PROGRESS` e falhou:

```
19:34:20 Performing health check on protocol `HTTP` [Path: '/health'], [Port: '3000'].
19:53:07 Health check failed on protocol `HTTP`[Path: '/health'], [Port: '3000'].
19:53:19 Failed to pull your application image. Reason: Invalid Access Role in
         AuthenticationConfiguration.
```

**A última linha é falsa.** A access role estava correta — tanto que a imagem
tinha sido baixada com sucesso minutos antes, no mesmo deploy. O App Runner
emite esse erro durante o rollback. Perseguir a mensagem mais alarmante do log
teria custado tempo à toa; a mensagem verdadeira é a do health check.

**Causa.** Um resíduo de configuração do meu próprio teste diagnóstico. Para o
teste B da seção 3 eu havia criado o serviço com um `StartCommand` que subia só
o Next. Quando reapliquei a configuração real, o `StartCommand` **continuou lá**.

O `update-service` do App Runner **mescla** o `ImageConfiguration` em vez de
substituir. Campo omitido não é apagado: é mantido.

O log de aplicação denunciou, para quem soubesse o que procurar:

```
19:35:03 ▲ Next.js 16.2.9
19:35:03 - Local: http://ip-172-31-136-235.ec2.internal:3000
```

Só o Next, e na porta **3000** — a porta do Express. Nenhuma linha do Express.
Com só o Next no ar, `/health` devolve 404 e o health check falha para sempre.

**Correção.** Declarar o `StartCommand` explicitamente:

```json
"ImageConfiguration": {
  "Port": "3000",
  "StartCommand": "node deploy/start.mjs"
}
```

**Lição.** Em `update-service`, campo omitido é campo herdado. Se você já mexeu
no serviço pelo console ou por um teste, declare tudo o que importa — não
confie no default da imagem.

Vale blindar o `deploy/aws/create-service.sh` com esse `StartCommand`, para que
o script seja idempotente mesmo sobre um serviço com configuração suja.

---

## 5. Incidente 3 — `/perfil/<id>` devolvendo 500

Este e o próximo apareceram depois, ao trazer o código novo do time (18 commits,
o módulo de perfil) para dentro do desenho de origem única. **Nenhum dos dois é
conflito de git** — o merge passou limpo nesses pontos e quebraria em produção.

**Sintoma.** `/perfil/<id>` respondia `500 Internal Server Error` — tanto com id
malformado quanto com UUID válido de perfil inexistente. `/perfil/editar` e
`/perfil/nao-encontrado` funcionavam.

O que os casos quebrados têm em comum é o **rewrite**: o `proxy.ts` só reescreve
para a página de não-encontrado nesses dois cenários, e os dois caminhos que
funcionavam são justamente os que ele ignora. Não cheguei a testar um perfil
existente antes da correção, então é provável que ele nunca tenha quebrado — o
erro estava no rewrite, não na página.

**A mensagem no log de aplicação:**

```
Failed to proxy https://localhost:3001/perfil/nao-encontrado
Error: write EPROTO ... SSL routines:tls_validate_record_header:wrong version number
```

**Causa.** O App Runner termina o TLS e encaminha a requisição com
`x-forwarded-proto: https`. O nosso proxy do Express repassava **todos** os
headers ao Next, inclusive esse. O Next então montava a `nextUrl` combinando o
protocolo do header (`https`) com o próprio host interno (`localhost:3001`).

O `proxy.ts` do time faz `NextResponse.rewrite(request.nextUrl.clone())`. Como
o Next considerava aquela origem diferente da sua, o rewrite deixava de ser
interno e virava um fetch externo — abrindo TLS contra uma porta que fala HTTP
puro. Daí o `wrong version number`.

**Como confirmei.** Reproduzi localmente antes de mexer em qualquer código,
rodando a imagem contra o postgres do compose e variando só o header:

| Requisição | Resultado |
|---|---|
| `/perfil/<uuid>` sem header | `404` (correto) |
| `/perfil/<uuid>` com `x-forwarded-proto: https` | `500` |
| idem + `x-forwarded-host` | `500` (não resolve) |
| `/perfil/<uuid>` com `x-forwarded-proto: http` | `404` (correto) |

**Correção.** Normalizar o header no salto interno, em
`apps/server/src/shared/http/web-proxy.ts`:

```ts
headers: { ...req.headers, "x-forwarded-proto": "http" },
```

Não é gambiarra: o salto Express → Next **é** HTTP puro, e o header passou a
dizer a verdade sobre ele. O Express continua recebendo o `https` original do
App Runner, que é do que o `@auth/express` depende para montar a callback do
Google. Nada no `apps/web` depende de saber o protocolo — conferido antes de
aplicar.

**Lição.** Ao colocar um proxy na frente, repassar headers cegamente propaga
para o processo de trás uma informação que só valia para o salto da frente.
`x-forwarded-proto` é o caso clássico.

---

## 6. Incidente 4 — `/onboarding` devolvendo JSON

**Sintoma.** `/onboarding` respondia
`{"code":"UNAUTHORIZED","message":"Authentication required"}` em vez da página.

Pior do que parece: o `login-card.tsx` manda o usuário para `/onboarding`
**depois** de logar. Autenticado, a rota devolveria o JSON do estado do
onboarding. Todo usuário novo veria JSON cru na tela.

**Causa.** Colisão de caminho. O Express já servia a API de onboarding montada
em `/onboarding` (`GET /` e `PUT /`), e o time criou uma **página** Next com
exatamente o mesmo caminho. Como o Express é a porta de entrada e o proxy para o
Next é o último middleware, a API vence sempre.

Em dois serviços isso nunca colidiria — eram origens diferentes. **A colisão é
uma consequência direta da origem única**, e é o tipo de coisa que só aparece
quando as duas apps passam a dividir o mesmo espaço de rotas.

**Correção.** Mover a API para o namespace `/api`, que já existia
(`/api/protected`):

- `apps/server/src/index.ts` → `app.use("/api/onboarding", ...)`
- `apps/web/src/features/onboarding/services/onboarding-api.ts` →
  `${serverUrl}/api/onboarding`
- as duas asserções em `onboarding-api.test.ts`

**Lição para o time.** Com origem única, **todo caminho de API novo deveria
nascer sob `/api/`**. Hoje `/users`, `/articles` e `/auth` estão na raiz e são
minas terrestres: no dia em que alguém criar uma página `/users`, ela não vai
carregar, e o sintoma vai parecer um bug do frontend.

Vale a pena migrar os três para `/api/` numa mudança isolada, antes que o
problema se repita.

---

## 7. Uma precaução que evitou um quinto incidente

O primeiro `docker build` gerou, além da imagem, um **attestation manifest** —
comportamento padrão do buildx. Isso faz o ECR guardar um índice de imagens em
vez de um manifest simples, e o App Runner tem histórico de recusar esse
formato.

Reconstruí antes de publicar:

```bash
docker build --platform linux/amd64 --provenance=false --sbom=false -t ... .
```

Confirmação de que o ECR guardou o formato certo:

```bash
aws ecr describe-images --repository-name arxio --region us-east-1 \
  --query "imageDetails[].imageManifestMediaType" --output text
# application/vnd.docker.distribution.manifest.v2+json
```

Se aparecer `...index.v1+json` ou `manifest.list`, reconstrua com as flags
acima. **Não cheguei a testar se falharia** — foi precaução, e ela vale porque
`CREATE_FAILED` é estado terminal: não aceita redeploy, só apagar e recriar.

---

## 8. Armadilhas de ferramenta no Windows

Custaram tempo e não têm nada a ver com a AWS.

| Sintoma | Causa | Solução |
|---|---|---|
| `InvalidParameterException` em `--log-group-name-prefix "/aws/..."` | Git Bash converte `/aws/...` em `C:/Program Files/Git/aws/...` | usar PowerShell, ou `MSYS_NO_PATHCONV=1` |
| `charmap codec can't encode '\u25b2'` ao ler logs | o `▲` do banner do Next contra o codepage do console | `chcp 65001` antes, ou `filter-log-events --filter-pattern` para desviar da linha |
| `Unknown options: GB","InstanceRoleArn"...` | PowerShell quebrando JSON inline no AWS CLI | passar a configuração em arquivo, com `file://` |
| `port is already allocated` ao subir o compose | outro projeto ocupando a 3000 na máquina | `docker run` com outra porta, na rede `arxio_default` |

Para ler os logs de aplicação sem esbarrar no encoding:

```powershell
aws logs filter-log-events --region us-east-1 `
  --log-group-name "/aws/apprunner/arxio/SERVICE_ID/application" `
  --filter-pattern "?Error ?error ?failed" `
  --query "events[].message" --output text
```

---

## 9. Resumo

| # | Sintoma | Causa | Correção |
|---|---|---|---|
| 1 | `CREATE_FAILED`, zero logs | VPC connector `ACTIVE` porém inoperante | apagar e recriar o connector |
| 2 | health check falhando 19 min | `StartCommand` residual — `update-service` mescla, não substitui | declarar `StartCommand` explicitamente |
| 3 | `/perfil/<id>` → 500 no rewrite | `x-forwarded-proto: https` repassado ao salto interno HTTP | normalizar o header no proxy |
| 4 | `/onboarding` → JSON | API e página no mesmo caminho, sob origem única | mover a API para `/api/onboarding` |

O que os quatro têm em comum: **nenhum deles aparece como erro de compilação, de
teste ou de merge**. Os dois primeiros exigiram teste A/B na própria AWS; os dois
últimos só apareceram exercitando as rotas depois do deploy.

Daí a única regra prática que este documento defende: **depois de publicar,
percorra as rotas**. Um `curl` em cada caminho custa trinta segundos e pega
exatamente a classe de problema que nenhum teste automatizado pegou.

```bash
URL=https://iqbmdyxemm.us-east-1.awsapprunner.com
for p in /health / /feed /login /onboarding /perfil/editar /articles /auth/csrf; do
  printf "%-24s " "$p"
  curl -s -o /dev/null -w "http=%{http_code}\n" "$URL$p"
done
```

---

## Referências

| Arquivo | O que é |
|---|---|
| `docs/DEPLOY_AWS_PASSO_A_PASSO.md` | o tutorial: criar cada peça, na ordem |
| `deploy/aws/README.md` | referência curta do dia a dia |
| `docs/LOGIN_COOKIES_CROSS_SITE.md` | por que o serviço é único |
| `docs/OAUTH_SETUP.md` | cadastro do cliente OAuth no Google |
| `Dockerfile` | constrói as duas apps numa imagem só |
| `deploy/start.mjs` | sobe os dois processos no container |
| `apps/server/src/shared/http/web-proxy.ts` | o repasse do Express para o Next |
