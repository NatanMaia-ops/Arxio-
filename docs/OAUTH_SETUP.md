# Configuracao do OAuth com Google Workspace

Este guia descreve como configurar o login da Arxio com Google OAuth 2.0. A aplicacao aceita somente contas verificadas dos dominios academicos:

- `aluno.uepb.edu.br`
- `uepb.edu.br`

A Arxio e um projeto academico independente e nao representa uma plataforma oficial da UEPB. O uso de um projeto ou organizacao Google Cloud institucional depende de autorizacao da universidade.

## Pre-requisitos

- Acesso ao [Google Cloud Console](https://console.cloud.google.com/).
- Um projeto Google Cloud para a aplicacao.
- As URLs publicas do server nos ambientes de desenvolvimento e producao.

## 1. Configurar o Google Auth Platform

1. Acesse o [Google Auth Platform](https://console.cloud.google.com/auth/overview) e selecione o projeto.
2. Em **Branding**, informe o nome da aplicacao, email de suporte e dados de contato do desenvolvedor.
3. Em **Audience**, escolha o tipo de audiencia:
   - Use **Internal** somente se o projeto pertencer a uma organizacao Google Workspace da UEPB e houver autorizacao administrativa.
   - Caso contrario, use **External**. Durante os testes, cadastre as contas academicas da equipe como test users.
4. Em **Data Access**, mantenha apenas os scopes necessarios para autenticacao: `openid`, `email` e `profile`.

Os **Authorized domains** da tela de branding representam os dominios onde a aplicacao esta hospedada. Eles nao substituem a validacao de email academico feita pelo server.

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

## 4. Validacao das contas academicas

O server autoriza o login somente quando o perfil retornado pelo Google atende a todos os criterios:

- O email foi verificado pelo Google (`email_verified`).
- O dominio do email e exatamente `aluno.uepb.edu.br` ou `uepb.edu.br`.
- O claim `hd` identifica a conta como pertencente a um dos dominios permitidos do Google Workspace.

Contas publicas, como Gmail ou Outlook, e contas de outros dominios sao recusadas. O parametro `hd` enviado na tela de login seria apenas uma sugestao visual; por isso, a autorizacao e validada novamente no server.

## 5. Testar a configuracao

1. Inicie o server.
2. Confirme que o Google aparece em `http://localhost:3000/auth/providers`.
3. Abra `http://localhost:3000/auth/signin/google` no navegador.
4. Teste uma conta de cada dominio permitido.
5. Confirme que uma conta publica ou de outro dominio e recusada.

## Problemas comuns

### `redirect_uri_mismatch`

Confirme que a URI cadastrada no Google Cloud corresponde exatamente a `${AUTH_URL}/auth/callback/google`, incluindo protocolo, host, porta e caminho.

### `AccessDenied`

O perfil nao passou pela politica academica. Verifique se o email esta confirmado e se os valores de dominio do email e do claim `hd` pertencem a lista permitida.

### `org_internal`

O cliente foi configurado como interno em uma organizacao que nao inclui a conta utilizada. Ajuste a audiencia ou use um projeto autorizado pela organizacao correta.

### Dominio `hd` diferente

O Google Workspace pode retornar o dominio principal da organizacao no claim `hd`, inclusive para contas de um dominio secundario. Se a infraestrutura da UEPB retornar outro dominio, confirme o valor com a administracao antes de adiciona-lo explicitamente a lista permitida. Nao remova essa verificacao nem aceite dominios por correspondencia parcial.
