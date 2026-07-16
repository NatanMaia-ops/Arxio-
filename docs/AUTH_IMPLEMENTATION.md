# Implementacao de Autenticacao

Este documento consolida o que foi implementado nos quatro primeiros commits de autenticacao da branch `feature/Oauth-login` e na etapa posterior de account linking.

O objetivo desta etapa foi preparar o server Express para autenticar contas academicas pelo Google Workspace, persistir usuarios e contas OAuth no PostgreSQL e disponibilizar um middleware para proteger rotas da API.

## Commits contemplados

| Commit | Objetivo |
| --- | --- |
| `e34e56e` | Configurar Auth.js e Google OAuth no Express |
| `a1fa851` | Restringir o login aos dominios academicos permitidos |
| `22028c9` | Criar o schema de persistencia do Auth.js com Drizzle |
| `5703432` | Criar middleware de autenticacao e rota protegida |

## Visao geral da arquitetura

O fluxo atual envolve quatro partes principais:

```text
Browser / frontend
       |
       | /auth/*
       v
ExpressAuth + Google Workspace
       |
       | callback e politica academica
       v
DrizzleAdapter
       |
       | users e accounts
       v
PostgreSQL

Browser / frontend
       |
       | cookie de sessao JWT
       v
middleware auth()
       |
       | getSession()
       v
res.locals.session -> rota protegida
```

As responsabilidades foram separadas da seguinte forma:

- `apps/server/src/auth.ts`: configuracao central do Auth.js.
- `apps/server/src/modules/auth/auth.service.ts`: criacao de usuarios OAuth, vinculo de contas e leitura da sessao.
- `apps/server/src/middleware.ts`: leitura da sessao e protecao de rotas.
- `apps/server/src/index.ts`: montagem dos endpoints no Express.
- `packages/db/src/schema/auth.ts`: tabelas utilizadas pelo adapter.
- `packages/db/src/schema/user.ts`: tabela canonica de usuarios da Arxio.
- `docs/OAUTH_SETUP.md`: configuracao externa no Google Cloud.

## 1. Dependencias do Auth.js

Foram adicionadas ao server:

- `@auth/express`: integracao oficial, ainda experimental, entre Auth.js e Express.
- `@auth/core`: nucleo do Auth.js.
- `@auth/drizzle-adapter`: persistencia de usuarios e contas por Drizzle ORM.

O projeto ja utilizava ESM, Express 5 e TypeScript, portanto nao foi necessario alterar o formato de modulos.

## 2. Variaveis de ambiente

As variaveis de autenticacao passaram a ser validadas em `packages/env/src/server.ts` e documentadas em `apps/server/.env.example`:

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=
JWT_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

### Finalidade de cada variavel

- `AUTH_URL`: origem canonica do server. Tambem evita o erro `UntrustedHost` do Auth.js em producao.
- `AUTH_SECRET`: segredo usado pelo Auth.js, inclusive para criptografar e validar a sessao JWT.
- `JWT_SECRET`: reservado para futuros JWTs proprios da API. Atualmente nao e consumido pela configuracao do Auth.js.
- `AUTH_GOOGLE_ID`: Client ID do cliente OAuth criado no Google Cloud.
- `AUTH_GOOGLE_SECRET`: Client Secret do cliente OAuth.

`AUTH_SECRET` e `JWT_SECRET` exigem pelo menos 32 caracteres. Segredos reais devem permanecer apenas em `apps/server/.env` ou no gerenciador de segredos do ambiente de deploy.

## 3. Handler Auth.js no Express

O arquivo `apps/server/src/auth.ts` cria a configuracao e exporta o handler:

```ts
export const authHandler = ExpressAuth(authConfig);
```

O handler e montado antes de `express.json()` porque o proprio `ExpressAuth` processa JSON e formularios das rotas de autenticacao:

```ts
app.use("/auth", authHandler);
```

O uso de `app.use("/auth")`, sem `*`, e intencional. O projeto usa Express 5, cuja versao de `path-to-regexp` nao aceita o padrao antigo `"/auth/*"` sem um parametro nomeado. `app.use("/auth")` cobre normalmente todas as subrotas.

### Rotas disponibilizadas

Entre as rotas criadas pelo Auth.js estao:

| Metodo | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/auth/providers` | Lista os providers disponiveis para o cliente |
| `GET` | `/auth/csrf` | Retorna o token CSRF usado em operacoes POST |
| `GET` | `/auth/signin` | Exibe a pagina de login padrao |
| `POST` | `/auth/signin/google` | Inicia o login com Google |
| `GET` | `/auth/callback/google` | Recebe o callback OAuth do Google |
| `GET` | `/auth/session` | Retorna a sessao atual ou `null` |
| `GET` / `POST` | `/auth/signout` | Exibe ou executa a saida da sessao |

O Auth.js usa o termo `signout`. Nao existe uma action nativa `/auth/logout` nesta versao.

As operacoes POST de login e saida devem incluir o token CSRF fornecido pelo Auth.js.

## 4. CORS e cookies

O CORS do Express foi ajustado para aceitar credenciais:

```ts
cors({
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
})
```

Isso permite que o frontend envie e receba o cookie de sessao em requisicoes para o server. No cliente HTTP, as chamadas tambem precisam usar credenciais, por exemplo `credentials: "include"` no `fetch`.

## 5. Provider Google Workspace

O unico provider configurado atualmente e o Google:

```ts
Google({
  clientId: env.AUTH_GOOGLE_ID,
  clientSecret: env.AUTH_GOOGLE_SECRET,
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email.trim().toLowerCase(),
    };
  },
})
```

O callback `profile` normaliza o email e mapeia os dados basicos retornados pelo Google. O `sub` identifica a conta no provider. O usuario da Arxio continua recebendo um UUID interno gerado pelo PostgreSQL.

O `allowDangerousEmailAccountLinking` permite que o Auth.js vincule a conta Google a um usuario local com o mesmo email. A opcao foi habilitada somente para esse provider porque o callback `signIn` exige email verificado e valida tanto o dominio do email quanto o claim `hd` do Google Workspace antes de qualquer criacao ou vinculo.

As opcoes `allowedDomains`, `allowPublicEmails` e `mapAccount` citadas inicialmente na task nao existem em `@auth/express`. O comportamento equivalente foi implementado pelos hooks suportados `profile` e `callbacks.signIn`.

## 6. Politica de email academico

Os dominios permitidos sao:

```text
aluno.uepb.edu.br
uepb.edu.br
```

O callback `signIn` autoriza a conta somente quando todos os criterios sao verdadeiros:

1. O provider e o Google.
2. O Google informou `email_verified === true`.
3. O dominio extraido do email corresponde exatamente a um dominio permitido.
4. O claim `hd` do Google Workspace tambem corresponde a um dominio permitido.

A comparacao do dominio e feita sobre o texto localizado depois do unico caractere `@`. Isso evita aceitar sufixos maliciosos como `usuario@eviluepb.edu.br` ou `usuario@naouepeb.edu.br`.

O claim `hd` confirma que a identidade pertence a um dominio hospedado no Google Workspace. Ele nao e substituido por um simples parametro visual na tela de login, pois esse parametro funcionaria apenas como sugestao de conta.

Contas Gmail, Outlook, emails nao verificados, perfis sem `hd` e dominios desconhecidos sao rejeitados.

## 7. Persistencia com DrizzleAdapter

O `DrizzleAdapter` foi conectado ao mesmo banco utilizado pelo restante do server:

```ts
adapter: DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
})
```

Foi decidido reutilizar a tabela `users` existente. Criar outra tabela de usuarios para o Auth.js separaria a identidade autenticada dos perfis, papeis e demais dados de dominio da Arxio.

Os metodos `createUser` e `linkAccount` do adapter integrado delegam ao `AuthService`. O servico usa o adapter Drizzle original para persistir os dados, evitando recursao e preservando o objeto completo da conta, incluindo tokens e metadados OAuth.

### Tabela `users`

A tabela existente foi adaptada ao contrato do Auth.js:

- A propriedade Drizzle `avatarUrl` passou a ser `image`.
- A propriedade Drizzle `emailVerifiedAt` passou a ser `emailVerified`.
- Os nomes fisicos `avatar_url` e `email_verified_at` foram preservados.
- `password_hash` passou a aceitar `NULL`.

O password hash nullable e necessario porque um usuario criado pelo Google nao possui senha local. Usuarios registrados pelo fluxo tradicional continuam recebendo um hash normalmente.

### Tabela `accounts`

Armazena a ligacao entre um usuario interno e uma conta OAuth:

- `user_id`: referencia `users.id`.
- `type`: tipo da conta, como `oidc`.
- `provider`: identificador do provider, atualmente `google`.
- `provider_account_id`: identificador da conta no Google.
- Tokens e metadados OAuth, como `access_token`, `refresh_token`, `id_token` e `expires_at`.

A chave primaria composta e formada por `provider` e `provider_account_id`. A FK para `users` utiliza `ON DELETE CASCADE`, e existe um indice em `user_id`.

### Tabela `sessions`

Foi criada com:

- `session_token` como chave primaria.
- `user_id` referenciando `users.id` com cascade.
- `expires` para a data de expiracao.

Ela prepara o projeto para database sessions. Entretanto, a estrategia ativa continua sendo JWT, portanto esta tabela ainda nao e utilizada pelo fluxo atual.

### Tabela `verification_tokens`

Foi criada com:

- `identifier`.
- `token`.
- `expires`.
- Chave primaria composta por `identifier` e `token`.

Essa tabela sera utilizada se um provider de email ou magic link for adicionado. O login atual com Google nao depende dela.

## 8. Estrategia de sessao

A configuracao mantem explicitamente:

```ts
session: {
  strategy: "jwt",
}
```

Isso significa que:

- `users` e `accounts` sao persistidos pelo adapter.
- O estado da sessao fica em um cookie JWT criptografado pelo Auth.js.
- A tabela `sessions` nao e consultada no fluxo atual.
- O logout remove o cookie, mas nao apaga uma linha de sessao no banco.
- Revogacao central de uma sessao individual ainda nao esta disponivel.

A estrategia foi mantida explicitamente porque, ao adicionar um adapter sem definir `strategy`, o Auth.js passa a preferir database sessions.

## 9. Migration do banco

A migration criada foi:

```text
packages/db/src/migrations/0002_create_auth_tables.sql
```

Ela executa:

1. Criacao de `accounts`.
2. Criacao de `sessions`.
3. Criacao de `verification_tokens`.
4. Remocao do `NOT NULL` de `users.password_hash`.
5. Criacao das FKs com cascade.
6. Criacao dos indices de `accounts.user_id` e `sessions.user_id`.

Tambem foram versionados:

```text
packages/db/src/migrations/meta/0002_snapshot.json
packages/db/src/migrations/meta/_journal.json
```

O snapshot e o journal fazem parte do historico usado pelo Drizzle para calcular migrations futuras e devem permanecer no controle de versao.

## 10. Compatibilidade com o modulo de usuarios

A API de dominio do modulo `users` continua usando os nomes:

- `avatarUrl`.
- `emailVerifiedAt`.

O `drizzleUserRepository` traduz esses nomes para as propriedades exigidas pelo Auth.js:

```text
row.image -> avatarUrl
row.emailVerified -> emailVerifiedAt
```

Criacao e atualizacao tambem mapeiam `avatarUrl` para `image` antes de acessar o Drizzle.

`findByEmailWithPasswordHash` passou a retornar `null` quando encontra um usuario OAuth sem senha local. Isso preserva o tipo `UserWithPasswordHash` apenas para usuarios que realmente possuem credenciais por senha.

## 11. Middleware de autenticacao

A versao instalada de `@auth/express` nao exporta uma funcao `auth()`. Ela exporta `ExpressAuth` e `getSession`.

Por isso, foi criado um middleware local em `apps/server/src/middleware.ts`:

```ts
export function auth(): RequestHandler {
  return async (req, res, next) => {
    const session = await authService.getSession(req);
    // validacao e continuidade da requisicao
  };
}
```

O middleware:

1. Le o cookie da requisicao.
2. Solicita ao Auth.js a sessao correspondente.
3. Retorna `401` quando nao existe usuario autenticado.
4. Coloca a sessao validada em `res.locals.session`.
5. Chama `next()` para continuar a requisicao.
6. Encaminha erros operacionais para o tratamento de erros do Express.

A resposta de acesso nao autenticado e:

```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### Por que `res.locals`?

`res.locals` e o mecanismo recomendado pelo `@auth/express` para dados vinculados ao ciclo de uma requisicao. Ele evita usar `req.session`, propriedade normalmente pertencente ao pacote `express-session`, e elimina um possivel conflito de tipos e comportamento no futuro.

Os tipos `AuthenticatedSession` e `AuthenticatedLocals` garantem que, depois do middleware, `session.user` e seu UUID interno estejam presentes.

### AuthService

O arquivo `apps/server/src/modules/auth/auth.service.ts` concentra tres operacoes:

- `createUserFromOAuth(profile)`: normaliza o email, retorna o usuario existente ou cria um novo usuario OAuth.
- `linkAccount(account)`: vincula o objeto completo da conta social, trata repeticoes como idempotentes e rejeita uma conta ja pertencente a outro usuario.
- `getSession(request)`: le a sessao atual a partir do cookie da requisicao.

O `Request` e obrigatorio em `getSession` porque o Auth.js obtem o cookie de sessao dos headers HTTP. O servico recebe suas dependencias no construtor, o que permite testar essas operacoes sem banco ou servidor HTTP reais.

Como a estrategia e JWT, o callback `session` copia `token.sub` para `session.user.id`. Assim, rotas protegidas recebem o UUID interno do usuario em vez de depender apenas do email.

## 12. Rota protegida de demonstracao

Foi criada a rota:

```text
GET /api/protected
```

Sua composicao e:

```ts
app.get("/api/protected", auth(), (_req, res) => {
  res.status(200).json(res.locals.session);
});
```

Sem um cookie Auth.js valido, ela responde `401`. Com uma sessao valida, responde `200` com o usuario e a expiracao da sessao.

Esse endpoint serve como referencia para proteger rotas futuras. O mesmo middleware pode ser aplicado a uma rota isolada ou a um `Router` inteiro.

## 13. Fluxo completo de login

O fluxo implementado funciona assim:

1. O frontend obtem o token CSRF do Auth.js.
2. O frontend inicia o login pelo endpoint do Google.
3. O Auth.js redireciona o usuario ao Google.
4. O Google autentica o usuario e chama `/auth/callback/google`.
5. O callback `signIn` valida `email_verified`, dominio do email e `hd`.
6. O adapter procura uma conta por `provider` e `provider_account_id`.
7. Se nao houver conta vinculada, o Auth.js procura um usuario pelo email normalizado.
8. Se o usuario ja existir, inclusive por cadastro manual, a conta Google e vinculada ao UUID existente.
9. Se o usuario nao existir, o `AuthService` cria o usuario OAuth e vincula a conta Google.
10. Nos logins seguintes, o adapter reutiliza a conta vinculada.
11. O Auth.js cria o cookie de sessao JWT.
12. O frontend inclui esse cookie nas requisicoes protegidas.
13. O middleware `auth()` valida o cookie e disponibiliza a sessao em `res.locals`.

## 14. Decisoes de seguranca

As seguintes decisoes foram aplicadas:

- Emails sao normalizados para lowercase.
- Dominios sao comparados por igualdade exata.
- O email precisa estar verificado pelo Google.
- O claim Workspace `hd` tambem precisa ser permitido.
- CORS aceita apenas a origem configurada.
- Cookies exigem `credentials: true` no server e no cliente.
- Segredos possuem validacao minima de tamanho.
- Client Secrets nao sao versionados.
- O account linking automatico esta habilitado apenas para o Google.
- O vinculo por email acontece somente depois da validacao de `email_verified`, dominio academico e claim `hd`.
- Uma conta social ja vinculada a outro UUID nao pode ser transferida pelo servico.
- O objeto completo da conta e persistido para nao descartar tokens ou metadados do provider.

O nome `allowDangerousEmailAccountLinking` sinaliza que essa opcao nao deve ser habilitada indiscriminadamente. Novos providers so devem recebe-la se oferecerem garantias equivalentes de verificacao do email e se passarem por uma politica explicita de confianca.

## 15. Validacoes executadas

Durante a implementacao foram executados:

- Typecheck isolado do server.
- Typecheck isolado do pacote DB.
- Typecheck completo do monorepo.
- Build de producao do server.
- Biome nos arquivos alterados.
- Geracao e revisao da migration Drizzle.
- Aplicacao das migrations no PostgreSQL Docker.
- Verificacao das tabelas, constraints e nullabilidade de `password_hash`.
- Smoke test do adapter para users, accounts, sessions e verification tokens.
- Testes de sete cenarios da politica de dominio academico.
- Smoke test de `/auth/providers` e `/auth/session`.
- Teste de `/api/protected` sem cookie, esperando `401`.
- Teste de `/api/protected` com JWT Auth.js valido, esperando `200`.
- Testes unitarios do `AuthService` para criacao, reutilizacao de usuario, vinculo, conflitos, idempotencia e leitura da sessao.

Comandos principais de validacao:

```bash
npm run check-types
npm run build -w apps/server
npm test -w apps/server
npx tsc -p packages/db/tsconfig.json --noEmit
npm run db:migrate
```

## 16. Limitacoes atuais e proximos passos

O estado atual ainda possui limites importantes:

- A tabela `sessions` existe, mas JWT continua sendo a estrategia ativa.
- A tabela `verification_tokens` existe, mas nenhum provider de email foi configurado.
- `email_verified_at` nao e preenchido automaticamente pelo login Google, apesar da verificacao ocorrer antes do login.
- `last_login_at` nao e atualizado pelo Auth.js.
- `disabled_at` ainda nao e consultado pelo callback de login ou middleware.
- Usuarios OAuth nao recebem automaticamente `student_profiles` ou `user_roles`.
- Usuarios OAuth com `password_hash = NULL` nao possuem login local por senha.
- O vinculo por email e automatico para o Google, mas ainda nao existe uma interface autenticada para vincular ou desvincular providers manualmente.
- Nao existe revogacao central de cookies JWT ja emitidos.
- O server ainda nao possui middleware global de erros em JSON.

Esses pontos nao impedem o fluxo OAuth atual, mas devem orientar as proximas tasks de autenticacao, autorizacao, onboarding e gerenciamento de conta.

## 17. Referencias internas

- Configuracao Auth.js: `apps/server/src/auth.ts`.
- Servico de autenticacao: `apps/server/src/modules/auth/auth.service.ts`.
- Testes do servico: `apps/server/src/modules/auth/auth.service.test.ts`.
- Middleware de autenticacao: `apps/server/src/middleware.ts`.
- Montagem das rotas: `apps/server/src/index.ts`.
- Schema Auth.js: `packages/db/src/schema/auth.ts`.
- Schema de usuarios: `packages/db/src/schema/user.ts`.
- Migration: `packages/db/src/migrations/0002_create_auth_tables.sql`.
- Configuracao Google Cloud: `docs/OAUTH_SETUP.md`.
