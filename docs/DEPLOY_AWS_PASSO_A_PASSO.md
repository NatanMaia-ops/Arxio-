# Subir a Arxio na AWS — guia passo a passo

Como configurar a AWS do zero e publicar a aplicação num **único serviço App
Runner**, com o web e o server no mesmo container.

O `deploy/aws/README.md` é a referência curta do dia a dia. Este guia é o
tutorial: explica cada peça, por que ela existe e em que ordem criar.

---

## 1. Onde sua conta está agora

Verificado na conta `839922332678`, região `us-east-1`:

| Peça | Estado |
|---|---|
| VPC connector `arxio-connector` | ✅ ACTIVE |
| RDS `arxio-db` (postgres 18.3) | ✅ available, privado |
| Regra de rede RDS ← connector | ✅ porta 5432 liberada |
| Role `AppRunnerECRAccessRole` | ✅ existe |
| Role `ArxioAppRunnerInstanceRole` | ✅ existe, com `ArxioSecretsRead` |
| Os 4 secrets `arxio/*` | ✅ existem |
| Repositório ECR `arxio` | ❌ falta criar |
| Serviço App Runner | ❌ **nenhum** |

> **Atenção:** os serviços App Runner não estão pausados — eles foram
> **apagados**. `aws apprunner list-services` volta uma lista vazia. Um serviço
> pausado apareceria com status `PAUSED`.
>
> A consequência prática: a URL antiga (`mzgnzn3za7...`) não volta. O serviço
> novo vai ganhar uma URL nova, e **a redirect URI do Google precisa ser
> recadastrada** com ela.

A boa notícia é que a parte trabalhosa — banco, rede, permissões e segredos —
continua de pé. Você só precisa das seções 4 e 5.

Os repositórios ECR `arxio-web` e `arxio-server` são do desenho antigo e podem
ser apagados depois que o serviço novo estiver funcionando.

---

## 2. As peças e por que cada uma existe

```
Internet
   │
   ▼
App Runner  (HTTPS gerenciado, escala automática)
   │  puxa a imagem ──────────────► ECR (registro de imagens Docker)
   │  lê os segredos ─────────────► Secrets Manager
   │  sai pela VPC ───────────────► VPC connector
   │                                     │
   └── container: Express :3000 ─────────┼──► RDS PostgreSQL (privado)
              └─ Next :3001 (interno)    │
                                          └──► NAT → internet (OAuth do Google)
```

| Peça | Para quê |
|---|---|
| **ECR** | onde a imagem Docker fica guardada. O App Runner não constrói nada: ele puxa uma imagem pronta. |
| **Access role** | crachá que o **App Runner** usa para puxar a imagem do ECR. |
| **Instance role** | crachá que o **seu container** usa para ler os segredos. |
| **Secrets Manager** | senha do banco e chaves de sessão. Nunca em variável de texto plano. |
| **RDS** | o PostgreSQL. Fica sem endereço público — só a VPC alcança. |
| **VPC connector** | o que dá ao container um pé dentro da VPC, para chegar ao RDS. |
| **Security group** | a regra que diz "o RDS aceita conexão vinda do connector". |

### As duas roles, que é o que mais confunde

São crachás diferentes, para portadores diferentes:

- **Access role** (`AppRunnerECRAccessRole`) — quem usa é o *serviço App
  Runner*, antes de o container existir, só para baixar a imagem. Confia em
  `build.apprunner.amazonaws.com`.
- **Instance role** (`ArxioAppRunnerInstanceRole`) — quem usa é o *container já
  rodando*, para ler os segredos. Confia em `tasks.apprunner.amazonaws.com`.

Trocar uma pela outra é a causa mais comum de `CREATE_FAILED` sem mensagem
clara. Os dois arquivos de confiança estão em `deploy/aws/`.

---

## 3. Pré-requisitos

- Docker rodando.
- AWS CLI v2 autenticado (`aws sts get-caller-identity` deve responder).
- Bash — Git Bash, WSL ou Linux.

Confira onde você está antes de qualquer coisa:

```bash
aws sts get-caller-identity
aws configure get region
```

---

## 4. Caminho rápido: subir agora

Use esta seção se a tabela da seção 1 continuar válida. Para entender ou
recriar cada peça, vá para a seção 6.

### 4.1 Criar o repositório da imagem

```bash
aws ecr create-repository --repository-name arxio --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

### 4.2 Construir e publicar a imagem

**A imagem precisa existir antes do serviço.** O App Runner tenta puxar
`:latest` no momento da criação; se não achar, o serviço nasce em
`CREATE_FAILED` e não aceita conserto — só apagar e criar de novo.

```bash
REGISTRY=839922332678.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY

docker build -t $REGISTRY/arxio:latest .
docker push $REGISTRY/arxio:latest
```

O build leva alguns minutos: ele constrói as duas apps na mesma imagem.

### 4.3 Criar o serviço

```bash
bash deploy/aws/create-service.sh
```

O script cria com uma URL de placeholder nas variáveis, porque a URL real só
existe depois que o serviço nasce. Ele imprime status e URL.

### 4.4 Esperar ficar de pé

```bash
aws apprunner list-services --region us-east-1 \
  --query "ServiceSummaryList[?ServiceName=='arxio'].[Status,ServiceUrl]" --output text
```

Repita até aparecer `RUNNING`. Leva de 3 a 8 minutos. Anote a URL.

### 4.5 Fechar o círculo com a URL real

O script é idempotente: rodar de novo com `PUBLIC_URL` faz um update em vez de
criar.

```bash
PUBLIC_URL=https://SUA_URL bash deploy/aws/create-service.sh
```

Isso ajusta `CORS_ORIGIN` e `AUTH_URL` e dispara um novo deploy.

### 4.6 Cadastrar a redirect URI no Google

Em [Google Cloud Console → Clients](https://console.cloud.google.com/auth/clients),
abra o cliente OAuth da Arxio e adicione em **Authorized redirect URIs**:

```text
https://SUA_URL/auth/callback/google
```

Sem esse passo o login falha com `redirect_uri_mismatch`. Detalhes em
`docs/OAUTH_SETUP.md`.

### 4.7 Validar

Vá para a seção 7.

---

## 5. Por que essa ordem

Cada passo depende do anterior. Fora de ordem, os erros são silenciosos:

1. **ECR antes da imagem** — sem repositório, o push não tem destino.
2. **Imagem antes do serviço** — o App Runner puxa na criação. Serviço criado
   sem imagem morre em `CREATE_FAILED`, que é um estado terminal.
3. **Secrets antes do serviço** — o serviço guarda o *ARN* de cada segredo. Se
   o segredo não existe, a criação falha.
4. **Connector antes do serviço** — a configuração de rede é passada na criação.
5. **URL real depois do serviço** — a URL só existe depois que ele nasce. Por
   isso o placeholder e o segundo comando.

O item 2 é o que mais custa tempo: `CREATE_FAILED` não aceita redeploy. Tem que
apagar o serviço e criar de novo.

---

## 6. Do zero: criar cada peça

Você não precisa desta seção agora — tudo aqui já existe na conta. Ela serve
para entender o que está montado, montar um ambiente de staging, ou refazer se
algo for apagado.

Cada passo começa com o comando de **conferência**. Se ele responder, pule.

### 6.1 Access role — App Runner puxa do ECR

```bash
aws iam get-role --role-name AppRunnerECRAccessRole --query Role.Arn --output text
```

Se não existir:

```bash
aws iam create-role --role-name AppRunnerECRAccessRole \
  --assume-role-policy-document file://deploy/aws/apprunner-ecr-trust-policy.json

aws iam attach-role-policy --role-name AppRunnerECRAccessRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
```

### 6.2 Instance role — o container lê os segredos

```bash
aws iam list-role-policies --role-name ArxioAppRunnerInstanceRole
```

Se não existir:

```bash
aws iam create-role --role-name ArxioAppRunnerInstanceRole \
  --assume-role-policy-document file://deploy/aws/apprunner-tasks-trust-policy.json

aws iam put-role-policy --role-name ArxioAppRunnerInstanceRole \
  --policy-name ArxioSecretsRead \
  --policy-document file://deploy/aws/apprunner-secrets-policy.json
```

A permissão é `secretsmanager:GetSecretValue` restrita a `arxio/*` — só os
segredos deste projeto, não os da conta inteira.

### 6.3 Segredos

```bash
aws secretsmanager list-secrets --region us-east-1 \
  --query "SecretList[?starts_with(Name,'arxio/')].Name" --output text
```

Se faltar algum:

```bash
aws secretsmanager create-secret --region us-east-1 \
  --name arxio/auth-secret --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret --region us-east-1 \
  --name arxio/jwt-secret --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret --region us-east-1 \
  --name arxio/google-client-secret --secret-string "COLE_O_CLIENT_SECRET"

aws secretsmanager create-secret --region us-east-1 \
  --name arxio/database-url \
  --secret-string "postgresql://USUARIO:SENHA@ENDPOINT:5432/arxio?sslmode=require"
```

O `sslmode=require` na URL não é decorativo: é o sinal que liga o TLS no
`packages/db`. O RDS recusa conexão sem TLS.

### 6.4 Banco de dados

```bash
aws rds describe-db-instances --db-instance-identifier arxio-db --region us-east-1 \
  --query "DBInstances[0].[DBInstanceStatus,PubliclyAccessible,Endpoint.Address]" --output text
```

O que importa na configuração:

- **`PubliclyAccessible: false`** — sem endereço público. O banco só é alcançado
  de dentro da VPC.
- **TLS obrigatório** — no PostgreSQL 15+ o parâmetro `rds.force_ssl` já vem
  ligado no parameter group padrão (`default.postgres18`, no caso). Não precisa
  mexer.
- **Migrations** — rodam no boot do container, antes de ele aceitar conexões. É
  o que permite aplicá-las sem expor o banco à internet.

### 6.5 VPC connector

É o que dá ao container um pé dentro da VPC.

```bash
aws apprunner list-vpc-connectors --region us-east-1 \
  --query "VpcConnectors[?VpcConnectorName=='arxio-connector'].[Status,Subnets]" --output text
```

O da conta usa as subnets `subnet-01c5779c2f056026e` e
`subnet-0f2427f301767cf5f`, com o security group `sg-08e29b2e607726dc1`.

Para criar um novo:

```bash
aws apprunner create-vpc-connector --region us-east-1 \
  --vpc-connector-name arxio-connector \
  --subnets subnet-AAA subnet-BBB \
  --security-groups sg-CCC
```

> **As subnets precisam ter rota para um NAT gateway.** Quando o egress é VPC,
> *todo* o tráfego de saída passa por ela — inclusive o que vai para o Google no
> OAuth. Subnet privada sem NAT faz o login travar sem erro claro, porque o
> container simplesmente não alcança `accounts.google.com`.

### 6.6 Liberar o banco para o connector

O RDS precisa aceitar conexão vinda do security group do connector.

```bash
aws ec2 describe-security-groups --group-ids sg-0ac43186bdfcf38f7 --region us-east-1 \
  --query "SecurityGroups[0].IpPermissions[].[FromPort,UserIdGroupPairs[].GroupId]" --output text
```

Deve mostrar a porta `5432` vinda de `sg-08e29b2e607726dc1`. Para criar a regra:

```bash
aws ec2 authorize-security-group-ingress --region us-east-1 \
  --group-id SG_DO_RDS --protocol tcp --port 5432 --source-group SG_DO_CONNECTOR
```

Repare que a origem é **outro security group**, não um bloco de IP. É a forma
correta: qualquer coisa que entre pelo connector é autorizada, sem depender de
IP fixo.

---

## 7. Validar

Com a URL em mãos:

```bash
curl -s -w "\n[%{http_code}]\n" https://SUA_URL/health
```

Deve responder `OK [200]` — isso prova que o Express, que é a porta de entrada,
está vivo.

Depois, no navegador:

- [ ] `https://SUA_URL` carrega a home.
- [ ] `https://SUA_URL/feed` lista artigos — prova que o container alcança o RDS.
- [ ] Login com Google **em aba anônima**. Esse é o teste que importa: era
      exatamente o cenário que quebrava no desenho de dois serviços.
- [ ] Recarregue depois de logar — deve continuar logado.
- [ ] Logout funciona.

O checklist completo de dispositivos está em `docs/LOGIN_COOKIES_CROSS_SITE.md`.

Para ver os logs, primeiro descubra o nome do log group — o App Runner inclui o
ID do serviço nele, então não dá para adivinhar:

```bash
aws logs describe-log-groups --region us-east-1 \
  --log-group-name-prefix /aws/apprunner/arxio \
  --query "logGroups[].logGroupName" --output text
```

Depois acompanhe o que termina em `/application`:

```bash
aws logs tail /aws/apprunner/arxio/SERVICE_ID/application --region us-east-1 --follow
```

O que termina em `/service` traz os eventos de deploy — é onde a causa de um
`CREATE_FAILED` aparece.

---

## 8. Dia a dia: publicar uma nova versão

O serviço tem `AutoDeploymentsEnabled`, então empurrar a tag `:latest` já
dispara o redeploy:

```bash
REGISTRY=839922332678.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY

docker build -t $REGISTRY/arxio:latest .
docker push $REGISTRY/arxio:latest
```

É isso. Sem build arg, sem reconstruir imagem quando a URL muda — o navegador
chama a API por caminho relativo, na própria origem.

---

## 9. Quando der errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Serviço em `CREATE_FAILED` | imagem não existia no ECR na hora da criação | estado terminal: `delete-service` e criar de novo, com a imagem já publicada |
| Health check falhando, container reiniciando | memória insuficiente | são dois processos Node; use `1 GB`, não `0.5 GB` |
| `redirect_uri_mismatch` no Google | redirect URI não cadastrada, ou cadastrada com a URL antiga | adicione `https://SUA_URL/auth/callback/google` |
| Callback do Google vindo em `http` | falta `trust proxy` no Express | já está no código; se mexer, não remova |
| Login trava sem erro | subnets do connector sem NAT gateway | o container não alcança o Google |
| Erro de conexão com o banco | regra do security group ausente, ou `sslmode` fora da URL | seções 6.3 e 6.6 |
| `AccessDeniedException` lendo segredo | instance role sem a policy, ou trocada com a access role | seção 6.2 |
| Não consegue criar um terceiro serviço | cota de **2 serviços App Runner por região** | apague um serviço antigo ou abra chamado no Support |

Antes de investigar, olhe os logs — quase sempre a mensagem está lá. O nome do
log group sai do comando da seção 7:

```bash
aws logs tail /aws/apprunner/arxio/SERVICE_ID/application --region us-east-1 --since 15m
```

---

## 10. O que custa dinheiro

Três coisas cobram enquanto existirem, independentemente de uso:

- **App Runner** — cobra pela memória provisionada o tempo todo, e pela CPU só
  quando atende requisição. É o item mais caro de deixar ligado à toa.
- **RDS** — cobra pela instância enquanto ela existir, mesmo sem tráfego.
- **NAT gateway** — cobra por hora e por volume trafegado. Costuma surpreender.

O ECR e o Secrets Manager custam pouco nessa escala.

Se o projeto for ficar parado, o caminho é **apagar o serviço App Runner** (a
imagem no ECR continua lá, e recriar leva minutos) e, se for parada longa,
tirar um snapshot do RDS antes de apagar a instância.

Pausar o serviço App Runner interrompe a cobrança de CPU, mas não é o mesmo que
apagar. E, como você viu na seção 1, é fácil confundir apagado com pausado —
confira sempre com `list-services`.

---

## 11. Derrubar tudo

Na ordem inversa das dependências:

```bash
SERVICE_ARN="$(aws apprunner list-services --region us-east-1 \
  --query "ServiceSummaryList[?ServiceName=='arxio'].ServiceArn | [0]" --output text)"
aws apprunner delete-service --region us-east-1 --service-arn "$SERVICE_ARN"

aws ecr delete-repository --repository-name arxio --region us-east-1 --force
```

O connector, as roles, os segredos e o RDS sobrevivem — é exatamente por isso
que recriar o serviço agora é rápido.

---

## Referências

| Arquivo | O que é |
|---|---|
| `deploy/aws/README.md` | referência curta: endereços, variáveis, publicar versão |
| `deploy/aws/create-service.sh` | cria ou atualiza o serviço App Runner |
| `deploy/aws/apprunner-*.json` | políticas de confiança e permissão das roles |
| `Dockerfile` | constrói as duas apps numa imagem só |
| `deploy/start.mjs` | sobe os dois processos dentro do container |
| `docs/OAUTH_SETUP.md` | cadastro do cliente OAuth no Google |
| `docs/LOGIN_COOKIES_CROSS_SITE.md` | por que o serviço é único, e o checklist de validação do login |
