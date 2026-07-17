# Configuracao do OAuth com Google

Este guia descreve como configurar o login da Arxio com Google OAuth 2.0. A aplicacao aceita qualquer conta autenticada cujo email tenha sido verificado pelo Google, independentemente do dominio.

A Arxio e um projeto academico independente e nao representa uma plataforma oficial da UEPB. O uso de um projeto ou organizacao Google Cloud institucional depende de autorizacao da universidade.

## Pre-requisitos

- Acesso ao [Google Cloud Console](https://console.cloud.google.com/).
- Um projeto Google Cloud para a aplicacao.
- As URLs publicas do server nos ambientes de desenvolvimento e producao.

## 1. Configurar o Google Auth Platform

1. Acesse o [Google Auth Platform](https://console.cloud.google.com/auth/overview) e selecione o projeto.
2. Em **Branding**, informe o nome da aplicacao, email de suporte e dados de contato do desenvolvedor.
3. Em **Audience**, escolha **External** para permitir contas Google de qualquer dominio. Enquanto a aplicacao estiver em modo de testes, cadastre as contas da equipe como test users.
4. Em **Data Access**, mantenha apenas os scopes necessarios para autenticacao: `openid`, `email` e `profile`.

Os **Authorized domains** da tela de branding representam os dominios onde a aplicacao esta hospedada. Eles nao restringem o dominio do email usado no login.

## 2. Criar o cliente OAuth

1. Acesse a pagina [Clients](https://console.cloud.google.com/auth/clients).
2. Clique em **Create Client**.
3. Selecione **Web application**.
4. Informe um nome que identifique o ambiente, como `Arxio local` ou `Arxio production`.
5. Em **Authorized redirect URIs**, adicione a URL de callback exata.

Para desenvolvimento local:

```text
http://localhost:3000/auth/callback/google
```

Para producao:

```text
https://SEU_DOMINIO_DO_SERVER/auth/callback/google
```

A origem da URL de producao deve ser a mesma configurada em `AUTH_URL`. O Google exige HTTPS fora de `localhost` e nao aceita wildcards na redirect URI.

O fluxo atual e processado no server pelo Auth.js. Por isso, **Authorized JavaScript origins** nao e necessario para essa integracao.

## 3. Configurar as variaveis de ambiente

Depois de criar o cliente, copie o Client ID e o Client Secret para `apps/server/.env`:

```env
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=seu-client-id
AUTH_GOOGLE_SECRET=seu-client-secret
AUTH_SECRET=uma-chave-aleatoria-com-pelo-menos-32-caracteres
JWT_SECRET=outra-chave-aleatoria-com-pelo-menos-32-caracteres
```

Os segredos podem ser gerados com:

```bash
openssl rand -hex 32
```

Gere um valor diferente para cada segredo. Nunca versione `.env`, Client Secrets ou arquivos de credenciais baixados do Google Cloud.

## 4. Validacao das contas Google

O server autoriza o login quando:

- O provider utilizado e o Google.
- O email foi verificado pelo Google (`email_verified`).

Contas Gmail, contas Google Workspace e contas Google associadas a outros dominios sao aceitas quando o Google confirma a propriedade do email. O claim `hd` nao faz parte da politica de autorizacao.

## 5. Testar a configuracao

1. Inicie o server.
2. Confirme que o Google aparece em `http://localhost:3000/auth/providers`.
3. Abra `http://localhost:3000/auth/signin` no navegador.
4. Clique em **Sign in with Google** para enviar o formulario `POST` com o token CSRF.
5. Teste uma conta Gmail e uma conta Google Workspace.
6. Confirme que ambas conseguem concluir o login.

## Problemas comuns

### `redirect_uri_mismatch`

Confirme que a URI cadastrada no Google Cloud corresponde exatamente a `${AUTH_URL}/auth/callback/google`, incluindo protocolo, host, porta e caminho.

### `AccessDenied`

O perfil nao passou pela politica de autenticacao. Verifique se o login foi realizado pelo provider Google e se o email da conta esta confirmado.

### `org_internal`

O cliente foi configurado como interno em uma organizacao que nao inclui a conta utilizada. Ajuste a audiencia ou use um projeto autorizado pela organizacao correta.

### `AdapterError`

O Auth.js nao conseguiu consultar ou atualizar as tabelas de autenticacao. Confirme que o PostgreSQL esta em execucao, que `DATABASE_URL` usa a porta correta e que as migrations foram aplicadas.
