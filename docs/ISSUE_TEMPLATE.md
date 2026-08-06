# Padrão de Escrita de Issues (Backlog)

Este documento define como escrever issues de implementação no backlog do GitHub, para que qualquer pessoa do time consiga pegar uma task e implementar sem precisar perguntar o óbvio. Nasceu da divisão do módulo de artigos em tasks (schema → domínio → casos de uso → HTTP).

## Quando usar

Sempre que uma issue representa uma unidade de trabalho de implementação (uma camada, uma feature, uma correção não trivial). Não é necessário para issues simples de bug óbvio ou tarefas administrativas.

## Título

Frase curta e descritiva, no mesmo espírito do Conventional Commits usado nos commits do projeto:

```text
feat(db): criar tabela articles
feat(server): camada de domínio do módulo articles
fix(web): corrigir redirecionamento de login
```

## Estrutura

Copiar este esqueleto ao abrir uma issue nova:

```markdown
## Contexto
Por que essa task existe e como ela se encaixa no objetivo maior.

## Escopo
- O que deve ser feito, especificamente (lista objetiva).

## Fora de escopo
- O que essa task **não** cobre (evita invasão de escopo de outra task).

## Arquivos/áreas de referência
- Aponta o equivalente já existente no código a ser espelhado.

## Critérios de aceite
- [ ] Item verificável 1
- [ ] Item verificável 2

## Dependências
- Task #N precisa estar mergeada antes.

## Como testar
- Comando(s) e/ou passo a passo manual pra validar.
```

## Guia de cada seção

- **Contexto** — uma ou duas frases. Não repete o escopo, explica o motivo. Quem lê deve entender por que a task existe sem precisar abrir outra issue.
- **Escopo** — lista objetiva do que implementar, com nomes de arquivo, campos, assinaturas de função quando fizer sentido. Quanto mais concreto, menos decisão ambígua sobra pra quem implementa.
- **Fora de escopo** — tão importante quanto o escopo. Existe pra impedir que quem implementa expanda a task pra território de outra issue (ou invente algo que ninguém pediu). Sempre que uma decisão foi adiada de propósito, ela é registrada aqui com o motivo.
- **Arquivos/áreas de referência** — aponta pro padrão já existente no código que deve ser espelhado (ex: "mesma estrutura de `modules/users`"). Isso substitui uma explicação de arquitetura do zero: a pessoa lê o código de referência.
- **Critérios de aceite** — checklist verificável. Cada item deve ser algo que dá pra confirmar objetivamente (passa/não passa), não uma descrição vaga tipo "funciona bem".
- **Dependências** — qual issue precisa estar mergeada antes. Sem isso, o backlog vira uma lista solta sem ordem clara.
- **Como testar** — comandos reais (não "rodar os testes" genérico) e, quando fizer sentido, passos manuais de verificação.

## Exemplo completo

```markdown
## Título
feat(db): criar tabela `articles`

## Contexto
Vamos iniciar o módulo de artigos/publicações. Esta é a primeira task da leva: sem a tabela e a migration, nenhuma das camadas seguintes (domínio, casos de uso, HTTP) tem onde persistir dados. Um artigo pertence a um usuário (autor) — é a nossa primeira tabela com FK direta para `users` fora do fluxo de auth/perfil de estudante.

## Escopo
- Criar `packages/db/src/schema/article.ts` com a tabela `articles`:
  - `id` — `uuid`, PK, `defaultRandom()`
  - `author_id` — `uuid`, `NOT NULL`, FK → `users.id`, `onDelete: "cascade"`
  - `title` — `varchar(200)`, `NOT NULL`
  - `content` — `text`, `NOT NULL`
  - `created_at` / `updated_at` — `timestamp`, `NOT NULL`, `defaultNow()`
  - Índice em `author_id`
- Exportar os tipos `Article` (`$inferSelect`) e `NewArticle` (`$inferInsert`)
- Registrar o export em `packages/db/src/schema/index.ts`
- Gerar a migration com `npm run db:generate` e versionar o SQL + snapshot gerados

## Fora de escopo
- Repository, service, controller, rotas — entram nas próximas tasks.
- Campos não essenciais pro MVP: `slug`, `status` (rascunho/publicado), tags/categorias.
- Rodar a migration em produção — já coberto pelo `deploy/aws/deploy-server.sh`.

## Arquivos/áreas de referência
Espelhar o estilo de `packages/db/src/schema/user.ts`, tabela `studentProfiles` — exemplo mais próximo de tabela com FK, índice e timestamps.

## Critérios de aceite
- [ ] `packages/db/src/schema/article.ts` criado conforme o escopo
- [ ] Tipos `Article` e `NewArticle` exportados
- [ ] Export adicionado em `packages/db/src/schema/index.ts`
- [ ] Migration gerada e versionada junto do snapshot
- [ ] `npx tsc -p packages/db/tsconfig.json --noEmit` passa sem erros
- [ ] Migration aplicada localmente e a tabela aparece no pgweb

## Dependências
Nenhuma — é a primeira task da leva.

## Como testar
\`\`\`powershell
npm run db:generate
npx tsc -p packages/db/tsconfig.json --noEmit
docker compose up -d postgres
npm run db:migrate
\`\`\`
Confirmar em `http://localhost:8085` (pgweb) que a tabela existe com as colunas e a FK esperadas.
```

## Convenções relacionadas

- Branch: `<numero-da-issue>-descricao-curta` (o número da issue vira prefixo da branch).
- Commits: Conventional Commits simples (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `build:`), sem `Co-authored-by`.
- Uma issue = uma unidade de trabalho revisável. Se a implementação real exigir mais de um commit, tudo bem — o que importa é que a issue não misture escopo de outra task.
