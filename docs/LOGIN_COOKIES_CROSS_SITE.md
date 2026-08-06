# Login falhando em alguns aparelhos — cookies entre sites

Guia para entender, confirmar e corrigir o erro **"Unable to sign in"** que
aparecia em `/login` apenas em alguns dispositivos.

Resumo em uma frase: o web e o server estavam em endereços diferentes, o login
depende de um cookie gravado no endereço do server, e vários navegadores se
recusam a gravar cookies de um endereço que não é o da página que o usuário está
vendo.

---

## 1. O que acontece na tela

1. O usuário abre `/login` e clica em **Continuar com Google**.
2. Em vez de abrir a tela do Google, aparece **"Unable to sign in"**.
3. Se ele clicar para entrar de novo, o Google funciona — mas o navegador para
   numa página branca escrito `OK`, que é o backend, não a aplicação.

Em outros aparelhos o mesmo login funciona de primeira. Não é intermitente: o
aparelho que falha falha sempre, o que funciona funciona sempre.

---

## 2. Por que isso acontece

No desenho antigo a aplicação vivia em dois endereços:

| Parte | Endereço |
|---|---|
| web (o site que o usuário vê) | `https://77m8xz4gkm.us-east-1.awsapprunner.com` |
| server (a API e o login) | `https://mzgnzn3za7.us-east-1.awsapprunner.com` |

Para o navegador, esses dois endereços são **dois sites distintos**. É a mesma
regra que impede um site hospedado em `fulano.github.io` de ler os cookies de
`ciclano.github.io`, mesmo os dois terminando em `github.io`.

O login acontece em duas etapas:

**Etapa 1 — pegar a senha da porta.** A página do web pede ao server um código de
segurança chamado *CSRF token*. O server responde com o código e manda o
navegador **guardar um cookie** com esse mesmo código.

**Etapa 2 — usar a senha da porta.** A página envia um formulário para o server
com o código. O server compara o código do formulário com o do cookie. Se bater,
o login segue para o Google.

O problema é a Etapa 1: quando a página em `77m8xz4gkm...` manda o navegador
guardar um cookie de `mzgnzn3za7...`, isso é um **cookie de terceiro** — a mesma
categoria dos cookies de rastreamento de publicidade. E muitos navegadores
bloqueiam isso por padrão.

Sem cookie na Etapa 1, a comparação da Etapa 2 falha e o Auth.js mostra
**"Unable to sign in"**.

> **A analogia.** É como deixar um crachá no guarda-volumes de um prédio e
> tentar retirá-lo na portaria de outro prédio. Os dois prédios são da mesma
> empresa, mas cada portaria só entrega o que está no próprio guarda-volumes.

### Quais navegadores bloqueiam

| Navegador | Cookie de terceiro | Login no desenho antigo |
|---|---|---|
| Chrome / Edge no desktop, aba normal | permite | funcionava |
| Chrome no desktop, aba anônima | bloqueia | falhava |
| Safari no Mac e no iPhone | bloqueia por padrão | falhava |
| Qualquer navegador no iPhone | bloqueia (todos usam o motor do Safari) | falhava |
| Firefox com proteção total | bloqueia | falhava |
| Brave | bloqueia | falhava |

É por isso que parecia aleatório: dependia do navegador do dispositivo, não do
dispositivo em si. **Todo iPhone falhava**, inclusive com Chrome instalado.

### Por que o segundo clique caía no backend

Depois do erro, o usuário estava numa página que pertencia ao **endereço do
server**. Clicar em entrar ali funcionava, porque agora o cookie era do próprio
site que ele estava vendo — deixou de ser cookie de terceiro.

Só que esse caminho não carregava a informação de "para onde voltar depois do
login". Sem ela, o Auth.js voltava para a raiz do server, que respondia `OK` — a
rota que a AWS usava para checar se o serviço estava no ar.

Esse detalhe é a **prova do diagnóstico**: o login funciona no exato momento em
que deixa de ser entre sites diferentes.

### Uma consequência que ainda não tinha aparecido

O mesmo bloqueio afetava a leitura da sessão (`fetchSession`, em
`apps/web/src/features/auth/services/auth-api.ts`). Mesmo que o login passasse
nesses aparelhos, o usuário continuaria aparecendo como deslogado, porque o
cookie de sessão também não seria enviado. A correção resolve os dois problemas
de uma vez.

---

## 3. Checklist: confirmar antes de mexer

Não altere nada antes de reproduzir. Leva cinco minutos.

- [ ] Abra a aplicação no **Chrome do desktop, em aba anônima**, e tente logar.
      A aba anônima bloqueia cookies de terceiro por padrão — **o erro deve
      aparecer**. Isso reproduz o bug na sua própria máquina.
- [ ] Abra na **aba normal** do mesmo Chrome. Deve funcionar.
- [ ] No aparelho que falha, depois do erro, copie a URL da barra de endereço.
      Ela deve ser algo como `.../auth/error?error=XXXX`.
- [ ] Anote o valor de `error=`:
  - `MissingCSRF` ou `Configuration` → **é o problema deste guia**, siga em frente.
  - `AccessDenied` → é outra causa (a conta Google não tem e-mail verificado,
    regra em `apps/server/src/modules/auth/google-auth-policy.ts`). **Pare aqui**,
    este guia não se aplica.
  - `OAuthCallback` → verifique antes se a redirect URI do Google está correta
    (ver `docs/OAUTH_SETUP.md`).
- [ ] Opcional, no Safari do Mac: Ajustes → Privacidade → desmarque **"Impedir
      rastreamento entre sites"** e teste de novo. Se passar a funcionar, o
      diagnóstico está fechado. **Marque a opção de volta depois.**

Se os dois primeiros itens se comportarem como descrito, você tem um caso
reproduzível — e vai conseguir testar a correção sem depender de emprestar
celular de ninguém.

---

## 4. A correção escolhida: um serviço só

As duas apps passam a rodar **no mesmo container, atrás do mesmo endereço**. Com
uma origem só, o cookie do Auth.js deixa de ser de terceiro em qualquer
navegador. Não é um contorno — é a remoção da causa.

Como o container é montado:

- O **Express** é a porta de entrada, na porta do App Runner. Ele responde
  `/auth`, `/users`, `/articles`, `/onboarding`, `/api` e `/health`.
- O **Next** roda em `127.0.0.1:3001`, sem porta exposta. Todo o resto do
  tráfego é repassado pelo Express.

A ordem importa e não é arbitrária: o `@auth/express` monta a URL de callback do
Google a partir do `Host` e do protocolo da requisição
(`req.protocol + req.get("host")`). Por isso o Express precisa receber a
requisição original, e não uma repassada por outro processo. O Next, atrás, não
depende disso.

### O que isso apagou do código

| Removido | Por quê |
|---|---|
| `crossSiteCookies()` no `authjs-config.ts` | os cookies padrão do Auth.js já servem |
| `NEXT_PUBLIC_SERVER_URL` como build arg | o navegador chama a API por caminho relativo |
| `SERVER_INTERNAL_URL` no compose | um container só, sem rede entre serviços |
| `apps/web/Dockerfile` e `apps/server/Dockerfile` | viraram um `Dockerfile` na raiz |

O ganho escondido é o build arg. Antes, trocar a URL do server obrigava a
**reconstruir a imagem do web**, porque o Next grava esse valor dentro do bundle.
Era a parte mais frágil do deploy, e ela desapareceu.

### Alternativas descartadas

**Domínio próprio** (`arxio.com.br` + `api.arxio.com.br`) também resolveria, e
continua valendo a pena para apresentar o projeto — mas custa registro de
domínio e espera de DNS, e mantém dois serviços para manter em sincronia. Com o
serviço unificado, adicionar um domínio depois fica mais simples ainda: é um
custom domain só, sem subdomínio de API e sem CORS.

**Proxy do `/auth` pelo Next** resolveria só o login, deixaria as chamadas de
artigos ainda entre sites, e colocaria o fluxo OAuth atrás de um proxy que pode
não preservar o `Host` — exatamente o cabeçalho de que o Auth.js depende.

---

## 5. Checklist: subir a correção

### 5.1 Validar localmente primeiro

- [ ] `docker compose up -d --build`
- [ ] `curl http://localhost:3000/health` → deve responder `OK`.
- [ ] Abra `http://localhost:3000` — a home do Next deve carregar pela mesma
      porta. Se carregar, o proxy do Express está funcionando.
- [ ] Faça login **em aba anônima**. É o teste que importa: era exatamente esse
      cenário que quebrava.
- [ ] Recarregue depois de logar e confirme que continua logado.

### 5.2 Publicar a imagem

```bash
REGISTRY=839922332678.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY

aws ecr create-repository --repository-name arxio --region us-east-1
docker build -t $REGISTRY/arxio:latest .
docker push $REGISTRY/arxio:latest
```

### 5.3 Reaproveitar o serviço existente

Não apague e recrie: recriar troca a URL do serviço, e aí a redirect URI do
Google precisa ser refeita. O `arxio-server` já tem o VPC connector, a instance
role dos secrets e uma URL já cadastrada no Google.

- [ ] Aponte o serviço para a nova imagem e suba a memória — são dois processos
      Node agora, `0.5 GB` não basta. Os comandos estão em `deploy/aws/README.md`.
- [ ] Confirme `CORS_ORIGIN` e `AUTH_URL` apontando para a URL do próprio
      serviço.
- [ ] Troque o health check para `/health`.

### 5.4 Validar em produção

Rode a seção 6 inteira antes de apagar qualquer coisa.

### 5.5 Só então, limpar

- [ ] Apague o serviço App Runner `arxio-web`.
- [ ] Apague os repositórios ECR `arxio-web` e `arxio-server`.

Deixar isso por último é o que garante rollback: enquanto o `arxio-web` existir,
dá para voltar a imagem anterior e ter o desenho antigo de volta.

---

## 6. Checklist: validar a correção

Teste nesta ordem. O primeiro item é o mais importante, porque é justamente o
cenário que estava quebrado.

- [ ] **Chrome desktop, aba anônima** — login completo, cai em `/feed` logado.
- [ ] **Chrome desktop, aba normal** — continua funcionando (não regrediu).
- [ ] **iPhone, Safari** — login completo.
- [ ] **Android, Chrome** — login completo.
- [ ] Depois de logar, **recarregue a página**: o nome do usuário deve continuar
      aparecendo no cabeçalho. Isso valida a leitura da sessão, não só o login.
- [ ] Faça **logout** e confirme que volta para a tela deslogada.
- [ ] Abra um artigo e a busca — valida que o proxy do Express para o Next está
      servindo as páginas normalmente.
- [ ] Em algum aparelho que já tinha logado antes, **limpe os cookies do site** e
      logue de novo, para garantir que não está funcionando por resquício antigo.

Se algum item falhar, anote o `error=` da URL como na seção 3 antes de investigar.

---

## 7. Como explicar isso para outra pessoa

Versão de 30 segundos, para banca, reunião ou pull request:

> "O site e a API estavam em endereços diferentes. O login precisa gravar um
> cookie no endereço da API, mas como quem pedia era o site, o navegador
> classificava aquilo como cookie de rastreamento e bloqueava. Safari e iPhone
> bloqueiam por padrão, Chrome não — por isso funcionava em uns aparelhos e em
> outros não. Juntamos os dois no mesmo container, atrás do mesmo endereço, o
> cookie deixou de ser de terceiro, e o problema acabou. De quebra, deu para
> apagar o código que tentava contornar isso."

Se perguntarem por que não bastou ajustar a configuração do cookie: já estava
ajustada da forma mais permissiva possível (`SameSite=None`). O bloqueio não é
sobre configuração — o navegador simplesmente não aceita cookies de terceiro,
independentemente do que o servidor peça.

---

## 8. O que vigiar no desenho novo

Nada é de graça. Dois pontos que valem monitorar:

**Um processo pode morrer sozinho.** São dois processos Node num container. O
`deploy/start.mjs` derruba o container se qualquer um dos dois cair, para o App
Runner reiniciar — mas se você vir reinícios repetidos, é aí que olhar primeiro.

**Deploy acoplado.** As duas apps sobem sempre juntas, na mesma imagem. Para o
tamanho do projeto isso é simplificação, não perda, já que as duas imagens eram
publicadas na mesma sessão de qualquer jeito.

**Tamanho da imagem.** A imagem carrega o monorepo inteiro com `node_modules`
para servir as duas apps. Dá para enxugar com um estágio de runtime separado —
é otimização, não correção, e vale fazer numa mudança isolada.

---

## 9. Glossário

- **Cookie de terceiro** — cookie de um endereço diferente do que está na barra
  do navegador. É o mecanismo usado por rastreadores de publicidade, e por isso
  vem sendo bloqueado.
- **CSRF token** — código de uso único que o servidor entrega e depois confere,
  para garantir que o formulário enviado saiu mesmo da página dele.
- **SameSite** — atributo do cookie que diz se ele pode viajar entre sites
  diferentes. `Lax` é o padrão seguro; `None` libera, mas só vale se o navegador
  aceitar cookies de terceiro.
- **Redirect URI** — endereço exato para onde o Google devolve o usuário depois
  do login. Precisa estar cadastrado, caractere por caractere.
- **App Runner** — serviço da AWS que roda a aplicação em container e cuida de
  HTTPS e escala.

---

## Referências no código

| Arquivo | Papel |
|---|---|
| `Dockerfile` | constrói as duas apps numa imagem só |
| `deploy/start.mjs` | sobe os dois processos e derruba o container se um cair |
| `apps/server/src/index.ts` | rotas de API, `/health` e o proxy para o Next |
| `apps/server/src/shared/http/web-proxy.ts` | o repasse para o Next |
| `apps/web/src/lib/api-base-url.ts` | escolhe caminho relativo ou endereço interno |
| `apps/web/src/features/auth/services/sign-in.ts` | inicia o login, pede o CSRF e envia o formulário |
| `deploy/aws/README.md` | endereços, variáveis e como publicar uma nova versão |
| `docs/OAUTH_SETUP.md` | cadastro do cliente OAuth no Google |
