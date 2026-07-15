# Configuracao do Google OAuth

Este documento descreve como criar as credenciais do Google usadas pela Arxio para autenticar contas academicas da UEPB.

A Arxio aceita somente contas Google Workspace com e-mail principal nos dominios:

- `aluno.uepb.edu.br`
- `uepb.edu.br`

Contas publicas, como `gmail.com`, sao recusadas pelo backend. A Arxio e um projeto independente e nao deve ser apresentada na tela de consentimento como uma plataforma oficial da UEPB.

## Pre-requisitos

- Uma conta com acesso ao [Google Cloud Console](https://console.cloud.google.com/).
- Um projeto existente ou permissao para criar um projeto no Google Cloud.
- A URL publica do backend para configurar o ambiente de producao.

## 1. Criar o projeto

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Abra o seletor de projetos no topo da pagina.
3. Selecione um projeto existente ou escolha **New Project**.
4. Use um nome que identifique a Arxio sem sugerir que o projeto e oficial da universidade.

## 2. Configurar a tela de consentimento

1. Acesse **Google Auth Platform** no projeto.
2. Em **Branding**, informe o nome da aplicacao e os dados de contato solicitados.
3. Em **Audience**, escolha o tipo de usuario disponivel para o projeto.
4. Em **Data Access**, mantenha apenas os escopos basicos `openid`, `email` e `profile`.

Use **Internal** somente se o projeto estiver dentro da organizacao Google Workspace da UEPB e essa opcao tiver sido autorizada pela administracao da universidade.

Para um projeto independente, normalmente sera necessario usar **External**. Durante o modo de teste, cadastre em **Test users** as contas academicas que participarao da validacao. A opcao **External** nao libera contas publicas na Arxio, pois o backend continua validando o Google Workspace e os dominios permitidos.

## 3. Criar as credenciais OAuth

1. Acesse **Google Auth Platform > Clients**.
2. Escolha **Create Client**.
3. Selecione **Web application**.
4. Defina um nome para identificar o client da Arxio.
5. Em **Authorized redirect URIs**, adicione a URI do ambiente local:

```text
http://localhost:3000/api/auth/callback/google
```

6. Para producao, adicione a URI com o dominio publico do backend:

```text
https://<dominio-da-api>/api/auth/callback/google
```

7. Confirme a criacao e guarde o **Client ID** e o **Client Secret**.

A redirect URI deve ser identica a URL usada pelo backend, incluindo protocolo, dominio, porta e caminho. Nao use a URL do frontend como callback.

## 4. Configurar o ambiente local

No arquivo `apps/server/.env`, configure:

```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<secret-aleatorio>
GOOGLE_CLIENT_ID=<client-id-do-google>
GOOGLE_CLIENT_SECRET=<client-secret-do-google>
```

Gere o secret do Better Auth com:

```bash
openssl rand -base64 32
```

O `BETTER_AUTH_URL` deve apontar para o backend, pois o Better Auth usa essa URL para construir o callback enviado ao Google.

Nunca adicione `apps/server/.env`, o Client Secret ou o secret do Better Auth ao Git. O arquivo versionado `apps/server/.env.example` deve conter somente valores ilustrativos.

## 5. Politica de acesso

O provider Google esta configurado com `hd: "*"`. Essa opcao exige que o token contenha o claim `hd`, que identifica uma conta gerenciada por Google Workspace, e rejeita contas Google publicas.

Depois da verificacao do token pelo Google, o backend tambem exige:

- e-mail marcado como verificado pelo Google;
- dominio exato `aluno.uepb.edu.br` ou `uepb.edu.br`;
- claim `hd` pertencente a um dos dominios permitidos.

O parametro `hd` enviado para a tela do Google tambem funciona como uma sugestao de selecao de conta, mas a decisao de acesso e feita com os dados verificados recebidos no callback.

## 6. Testar a configuracao

Quando as rotas de autenticacao estiverem conectadas ao Express, valide pelo menos:

| Conta | Resultado esperado |
| --- | --- |
| `usuario@aluno.uepb.edu.br` | Permitida |
| `usuario@uepb.edu.br` | Permitida |
| `usuario@gmail.com` | Recusada |
| `usuario@subdominio.uepb.edu.br` | Recusada |
| `usuario@uepb.edu.br.exemplo.com` | Recusada |

Esta etapa configura apenas o provider. O handler HTTP do Better Auth sera conectado ao Express em uma task posterior.

## Problemas comuns

### `redirect_uri_mismatch`

Confirme que a URI cadastrada no Google Cloud e identica ao callback gerado a partir de `BETTER_AUTH_URL`:

```text
http://localhost:3000/api/auth/callback/google
```

### `invalid_client`

Confirme se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` pertencem ao mesmo OAuth Client e ao projeto correto.

### Aplicacao bloqueada ou acesso negado

Se a tela de consentimento estiver em modo de teste, confirme se a conta academica foi adicionada em **Test users**. Se o projeto estiver configurado como **Internal**, apenas usuarios da organizacao Google Workspace proprietaria do projeto poderao acessar.

### Conta institucional recusada pela Arxio

Confirme qual e o e-mail principal retornado pelo Google. Um e-mail academico configurado apenas como alias nao sera aceito se o perfil autenticado retornar um endereco principal de outro dominio.
