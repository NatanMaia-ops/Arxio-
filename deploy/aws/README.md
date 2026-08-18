# Deploy — AWS App Runner

O `server` (`apps/server`) e o `web` (`apps/web`) rodam **num único serviço App
Runner** em `us-east-1`, a partir de uma imagem só no ECR. O banco é o RDS
PostgreSQL `arxio-db`, acessível apenas de dentro da VPC.

Uma origem só é o que faz o login funcionar em todo navegador: os cookies do
Auth.js deixam de ser cookies de terceiro. O histórico dessa decisão está em
`docs/LOGIN_COOKIES_CROSS_SITE.md`.

## Como o container é montado

O `Dockerfile` na raiz constrói as duas apps e o `deploy/start.mjs` sobe os dois
processos:

- **Express** escuta na porta do App Runner (`PORT`, 3000) e é a porta de
  entrada. Ele responde `/auth`, `/users`, `/articles`, `/onboarding`,
  `/api` e `/health`.
- **Next** escuta em `127.0.0.1:3001`, sem porta exposta. Todo o resto do
  tráfego é repassado pelo Express (`apps/server/src/shared/http/web-proxy.ts`).

O Express na frente é proposital: o `@auth/express` monta a URL de callback do
Google a partir do `Host` e do protocolo da requisição, então ele precisa
receber a requisição original. O Next, atrás, não depende disso.

Se qualquer um dos dois processos morrer, o `start.mjs` derruba o container e o
App Runner reinicia.

## Pré-requisitos

- Docker rodando localmente.
- AWS CLI v2 autenticado com permissão para ECR, IAM, App Runner e Secrets Manager.
- Bash (Git Bash, WSL ou Linux).

## Publicar uma nova versão

O serviço usa `AutoDeploymentsEnabled`, então enviar a tag `:latest` para o ECR
já dispara o redeploy.

```bash
REGISTRY=839922332678.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY

docker build -t $REGISTRY/arxio:latest .
docker push $REGISTRY/arxio:latest
```

Não existe mais build arg: o navegador chama a API por caminho relativo, na
própria origem. Trocar a URL pública não exige mais reconstruir imagem.

## Criar o serviço do zero

```bash
bash deploy/aws/create-service.sh
```

O script cria com `PUBLIC_URL` de placeholder porque a URL só existe depois da
criação. Assim que o serviço subir, edite as duas variáveis com a URL real:

```text
CORS_ORIGIN=https://SUA_URL
AUTH_URL=https://SUA_URL
```

E cadastre a redirect URI correspondente no Google (ver `docs/OAUTH_SETUP.md`):

```text
https://SUA_URL/auth/callback/google
```

## Migrar do desenho antigo (dois serviços)

Se os serviços `arxio-server` e `arxio-web` ainda existirem, o caminho de menor
risco é **reaproveitar o `arxio-server`** em vez de criar um serviço novo. Ele já
tem o VPC connector, a instance role dos secrets e — o que mais importa — uma URL
já cadastrada no Google.

1. Publique a imagem unificada no repositório `arxio` (comandos acima).
2. Aponte o serviço existente para ela e suba a memória, numa chamada só:

```bash
SERVICE_ARN="$(aws apprunner list-services --region us-east-1 \
  --query "ServiceSummaryList[?ServiceName=='arxio-server'].ServiceArn | [0]" --output text)"

aws apprunner update-service --region us-east-1 --service-arn "$SERVICE_ARN" \
  --instance-configuration '{"Cpu":"0.5 vCPU","Memory":"1 GB","InstanceRoleArn":"arn:aws:iam::839922332678:role/ArxioAppRunnerInstanceRole"}'
```

3. Ajuste `CORS_ORIGIN` para a URL do próprio serviço e confirme que `AUTH_URL`
   termina em `/auth`.
4. Valide o login (ver checklist em `docs/LOGIN_COOKIES_CROSS_SITE.md`).
5. Só depois, apague o serviço `arxio-web` e o repositório ECR `arxio-web`.

O passo 5 por último é o que garante rollback: enquanto o `arxio-web` existir,
dá para voltar a imagem anterior no `arxio-server` e ter o desenho antigo de
volta.

## Configuração do serviço

- Porta 3000, egress pela VPC via o connector `arxio-connector`, que é o que dá
  acesso ao RDS privado. As subnets têm NAT gateway, então o container continua
  alcançando a internet (necessário para o OAuth do Google).
- Instance role `ArxioAppRunnerInstanceRole`, que permite ler os secrets.
- Segredos vêm do Secrets Manager (`arxio/database-url`, `arxio/auth-secret`,
  `arxio/jwt-secret`, `arxio/google-client-secret`), nunca de variável em texto
  plano.
- `0.5 vCPU` / `1 GB` — são dois processos Node no mesmo container. Com `0.5 GB`
  o Next e o Express competem por memória e o container reinicia sob carga.
- Health check em `/health`, que é uma rota do Express. Como o Express é a porta
  de entrada, uma resposta nessa rota prova que o processo certo está vivo.

## Variáveis de ambiente

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `AUTH_URL` | `https://SUA_URL` — sem caminho no fim |
| `CORS_ORIGIN` | `https://SUA_URL` |
| `AUTH_GOOGLE_ID` | client ID do OAuth |
| `PORT` | opcional, default 3000 |
| `WEB_PORT` | opcional, default 3001 |
| `MEDIA_BUCKET` | nome do bucket S3 usado para avatares e capas |
| `MEDIA_REGION` | região AWS do bucket, por exemplo `us-east-1` |
| `MEDIA_PUBLIC_BASE_URL` | origem pública das imagens, sem `/` no final |

## Contrato externo para imagens

O backend está preparado para upload direto do navegador ao S3 usando um
presigned POST com validade de cinco minutos. O bucket, o CloudFront e as
políticas não são criados por este repositório; precisam ser entregues pela
pessoa responsável pela infraestrutura antes de habilitar o fluxo em produção.

Requisitos do bucket:

- aceitar via CORS o método `POST` vindo da origem pública da Arxio;
- manter uma lifecycle rule que remova objetos do prefixo `pending/` depois de
  um dia;
- permitir apenas JPEG, PNG e WebP de até 5 MB por meio da policy assinada pelo
  backend;
- manter leitura pública pela origem informada em `MEDIA_PUBLIC_BASE_URL`. A
  opção recomendada é bucket privado atrás de CloudFront com OAC;
- entregar `X-Content-Type-Options: nosniff` na resposta pública das imagens.

A instance role `ArxioAppRunnerInstanceRole` precisa das ações abaixo limitadas
ao bucket e aos prefixos `pending/`, `avatars/` e `article-covers/`:

```text
s3:PutObject
s3:GetObject
s3:DeleteObject
```

`HeadObject` utiliza `s3:GetObject`; a promoção do arquivo temporário usa
`GetObject` na origem e `PutObject` no destino. As credenciais não são expostas
ao frontend: o SDK usa a instance role do App Runner para assinar cada upload.

Como o arquivo vai direto do navegador ao S3, esta versão valida tamanho e o
`Content-Type` registrado no objeto, mas não inspeciona os bytes internos da
imagem. Inspeção por assinatura de arquivo, antivírus ou normalização deve ser
adicionada como uma etapa assíncrona na infraestrutura caso passe a ser um
requisito.

O `/auth` da callback não vem do `AUTH_URL`: o `@auth/express` deriva o
`basePath` do ponto onde o handler está montado no Express, que é
`app.use("/auth", authHandler)`. O papel do `AUTH_URL` aqui é ligar o
`trustHost` do Auth.js — a origem em si vem do `Host` da requisição.

`CORS_ORIGIN` continua existindo para o desenvolvimento local, onde o Next roda
em `:3001` separado do Express em `:3000`. Em produção, com origem única, o CORS
nunca chega a ser exercitado.

## Banco de dados

O RDS tem `rds.force_ssl=1`, então toda conexão precisa ser TLS. O
`packages/db` carrega o bundle de CAs da Amazon (`rds-ca.pem`) e valida o
certificado do servidor.

O `sslmode` é removido da connection string antes de ela chegar ao `pg`: o
driver sobrescreve a configuração `ssl` passada em código com o que vier na
string, e `sslmode=require` descartaria a CA. A presença de `sslmode` na URL
continua sendo o sinal que liga o TLS.

As migrations rodam no boot do server, antes do `listen`. É o que permite
aplicá-las sem expor o RDS à internet, já que o container roda dentro da VPC.

## Login com Google

O client OAuth precisa ter cadastrado, em **Authorized redirect URIs**:

```text
https://SUA_URL/auth/callback/google
```

O server usa `app.set("trust proxy", true)`. Sem isso o Auth.js monta a URL de
callback em `http`, porque o App Runner termina o TLS e encaminha a requisição
em texto claro — e o Google recusa redirect URIs que não sejam `https`.

## Cota de serviços

A conta está limitada a **dois serviços App Runner por região**, independente da
cota exibida em Service Quotas. Com o desenho unificado sobra um slot livre, o
que abre espaço para um ambiente de staging.
