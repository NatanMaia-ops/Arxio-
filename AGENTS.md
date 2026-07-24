# AGENTS.md

## Contexto do Projeto

Arxio é uma plataforma acadêmica em formato de rede acadêmica para compartilhar estudos, projetos e conhecimento. O público inicial é a comunidade do curso de Ciência da Computação da UEPB, campus Patos, incluindo estudantes, professores e pessoas interessadas.

O projeto é independente, desenvolvido por estudantes da UEPB no contexto da disciplina de Engenharia de Software. Não deve ser apresentado como uma plataforma oficial da universidade.

O objetivo do produto é criar um ambiente para divulgação e compartilhamento de conhecimento produzido no cotidiano acadêmico: estudos, artigos, relatos de aprendizado, projetos de disciplina, iniciação científica, TCCs em andamento, tutoriais técnicos, experimentos, datasets e materiais complementares.

Os princípios centrais definidos para a Arxio são:

- Colaboração acadêmica.
- Compartilhamento de conhecimento.
- Incentivo à escrita.

## Modo de Colaboração

O usuário quer aprender o fluxo de implementação e entender o motivo de cada decisão. Evite implementar grandes mudanças sem explicar antes a arquitetura, o porquê da ordem de implementação e os efeitos esperados.

Quando o usuário pedir implementação direta, implemente. Quando estiver debatendo arquitetura ou produto, priorize explicar e validar decisões antes de editar arquivos.

Não adicionar `Co-authored-by` em commits.

## Stack Atual

Monorepo TypeScript criado com Better-T-Stack.

Principais tecnologias:

- Next.js no `apps/web`.
- Express no `apps/server`.
- PostgreSQL com Drizzle ORM no `packages/db`.
- Docker Compose para web, server e Postgres.
- Turborepo para orquestração de scripts.
- Biome para lint/format.
- Shared UI package em `packages/ui` com componentes shadcn/ui.

## Banco de Dados

O banco usa Drizzle. As tabelas ficam em:

```text
packages/db/src/schema/
```

Cada arquivo de schema deve declarar uma única tabela e manter junto dela os
tipos inferidos de leitura e inserção. Os arquivos usam nomes no singular e
kebab-case quando o nome é composto. O `index.ts` é apenas o agregador de
exports e não declara tabelas.

Tabelas já trabalhadas:

- `users`
- `student_profiles`
- `roles`
- `user_roles`

Migration gerada para `student_profiles`, `roles` e `user_roles`:

```text
packages/db/src/migrations/0001_create_student_profiles_roles_user_roles.sql
packages/db/src/migrations/meta/0001_snapshot.json
packages/db/src/migrations/meta/_journal.json
```

O `snapshot.json` é gerado pelo Drizzle e deve ser versionado junto da migration. Ele representa uma foto do schema usada pelo Drizzle para calcular próximas migrations.

## Docker e Postgres

Foi identificado conflito entre o Postgres local do Windows e o Postgres do Docker usando a mesma porta `5432`.

O serviço local do Windows encontrado foi:

```text
postgresql-x64-18
```

Para usar Postgres local e Docker ao mesmo tempo, a decisão foi expor o Postgres Docker em outra porta no host:

```yaml
ports:
  - "5433:5432"
```

Com isso:

```text
Postgres local Windows: localhost:5432
Postgres Docker Arxio:  localhost:5433
```

Dentro da rede Docker, o server continua usando:

```text
postgres:5432
```

Comandos úteis:

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
Get-Service -Name postgresql-x64-18
Set-Service -Name postgresql-x64-18 -StartupType Automatic
Start-Service -Name postgresql-x64-18
Stop-Service -Name postgresql-x64-18
```

## Módulo Users no Server

O módulo `users` foi reorganizado para separar responsabilidades:

```text
apps/server/src/modules/users/
  entities/
    user.entity.ts

  repositories/
    user-repository.ts

  infra/
    repositories/
      drizzle-user-repository.ts

  http/
    dtos/
      create_user.dto.ts
      user_response.dto.ts
```

Diretrizes:

- `entities/`: tipos de domínio da aplicação.
- `repositories/`: contratos de persistência.
- `infra/repositories/`: implementações concretas, como Drizzle.
- `http/`: itens ligados à camada HTTP, como DTOs, controllers e rotas.

Foi decidido evitar `providers` para repositories, pois `repositories` comunica melhor a responsabilidade. `providers` pode ser usado futuramente para abstrações auxiliares como hash de senha, geração de token ou integração externa.

## README

O README público foi reformulado para ser institucional e focado no produto, sem rotas, scripts ou detalhes técnicos.

Banner usado:

```text
docs/banner-readme.png
```

O README apresenta:

- Sobre a plataforma.
- Objetivos.
- Público-alvo.
- Proposta da Arxio.
- Tipos de conteúdo.
- Princípios do projeto.
- Status de MVP em desenvolvimento.
- Contexto acadêmico.

## Branches e PRs Recentes

Branch de documentação e organização do módulo users:

```text
8-improve-users-module-readme
```

Commits criados nessa branch:

```text
docs: improve project readme
refactor: organize users module structure
```

Essa branch foi enviada para o remoto e depois incorporada na `main`.

Em 2026-06-18, a `main` foi atualizada com:

```text
24dace5 Merge pull request #14 from NatanMaia-ops/8-improve-users-module-readme
```

Branch criada para trabalhar na homepage:

```text
9-create-homepage
```

## Frontend e Homepage

Objetivo atual: criar uma homepage para apresentação em aula.

Estado inicial observado em `apps/web`:

- `apps/web/src/app/page.tsx` ainda estava com conteúdo de template/ASCII.
- `apps/web/src/app/layout.tsx` usa `Header` e `Providers`.
- CSS global vem de `apps/web/src/index.css`, que importa `@arxio/ui/globals.css`.
- Componentes existentes em `apps/web/src/components`: `header`, `loader`, `mode-toggle`, `providers`, `theme-provider`.
- Componentes compartilhados disponíveis em `packages/ui/src/components`: `button`, `card`, `checkbox`, `dropdown-menu`, `input`, `label`, `skeleton`, `sonner`.
- Ícones disponíveis via `lucide-react`.

Direção recomendada para a homepage:

- Criar uma landing institucional estática e apresentável.
- Usar tom acadêmico/institucional.
- Manter a composição da rota no App Router e agrupar a UI específica da homepage em `components/home`:

```text
apps/web/src/app/page.tsx
apps/web/src/components/home/
  home-hero.tsx
  home-product-preview.tsx
```

- Reservar `features` para domínios funcionais com comportamento próprio, não para páginas institucionais.
- Evitar implementar autenticação ou fluxo real antes da apresentação, a menos que seja explicitamente solicitado.

Conteúdo sugerido para homepage:

- Hero com nome Arxio e frase: "Uma rede acadêmica para compartilhar estudos, projetos e conhecimento."
- Seção de objetivos.
- Seção de público-alvo.
- Seção "O que a plataforma propõe".
- Tipos de conteúdo.
- Princípios do projeto.
- Status MVP em desenvolvimento.

## Diretrizes de Arquitetura Frontend

A arquitetura do web combina composição pelo Next.js App Router com vertical slices apenas para domínios funcionais reais. O modelo deve ser aplicado de forma incremental, sem criar pastas vazias ou camadas que ainda não possuem responsabilidade concreta.

### Fronteiras do Web

- `apps/web/src/app`: rotas, layouts, metadata, loading/error boundaries e providers globais do Next.js.
- `apps/web/src/components`: componentes visuais e composições específicas da aplicação, organizados por contexto quando necessário, como `components/home` e futuramente `components/layout`.
- `apps/web/src/features`: vertical slices de capacidades funcionais com comportamento próprio, como `auth`, `articles`, `profiles`, `timeline` e `payments`.
- `apps/web/src/lib`: infraestrutura e utilitários compartilhados dentro do web, como cliente HTTP, tratamento de erros e formatadores. Criar somente quando existir uso real.
- `packages/ui`: primitives e componentes do design system reutilizáveis entre diferentes contextos ou aplicações.
- Futuro `packages/contracts`: schemas e contratos compartilhados entre web e server, somente quando a duplicação real justificar esse pacote.

Uma rota ou seção visual não é automaticamente uma feature. A homepage institucional pertence a `components/home` porque é composição de UI e não contém um domínio funcional próprio.

### Estrutura Atual

```text
apps/web/src/
  app/
    layout.tsx
    page.tsx
    providers.tsx

  components/
    home/
      home-hero.tsx
      home-product-preview.tsx

  index.css
```

Não criar `features` ou `lib` enquanto não houver código que pertença a essas fronteiras.

### Estrutura Futura de uma Feature

Uma feature deve começar pequena e ganhar subpastas apenas conforme sua complexidade real. Exemplo de uma feature madura de autenticação:

```text
features/
  auth/
    components/
      login-form.tsx
      register-form.tsx
    api/
      auth-api.ts
    schemas/
      auth.schema.ts
    types/
      auth.types.ts
    hooks/
      use-auth.ts
    services/
      sign-in.ts
    index.ts
```

- `components`: apresentação ligada ao domínio funcional.
- `api`: comunicação HTTP exclusiva da feature.
- `schemas`: validações de entrada e resposta usadas pelo frontend.
- `types`: tipos exclusivos da feature.
- `hooks`: estado e integração com o ciclo de vida do React.
- `services`: orquestração de casos de uso do frontend quando uma simples chamada de API não for suficiente.
- `index.ts`: API pública opcional da feature. Evitar barrels globais e não misturar exports client-only com server-only sem necessidade.

Nenhuma dessas subpastas é obrigatória. Uma feature simples pode começar com dois ou três arquivos diretamente em sua raiz.

### Direção das Dependências

```text
app -> components -> features -> lib
                    \-> packages/ui
```

- `app` pode compor componentes, features e infraestrutura compartilhada.
- Componentes de composição da aplicação podem consumir a API pública de uma feature.
- Features não importam arquivos internos de outras features. Fluxos entre domínios devem ser compostos em `app`, em um componente de nível superior ou por contratos públicos explícitos.
- `lib` não importa `app`, `components` ou `features`.
- `packages/ui` não conhece regras, rotas ou domínios da Arxio.
- O web não importa `packages/db` e não acessa o banco diretamente.

### Frontend e Backend

O frontend é responsável por estado de interface, validação para experiência do usuário, chamadas HTTP, loading, erros, feedback e orquestração visual.

O Express continua sendo a fonte autoritativa para regras de negócio, autorização, permissões, validações definitivas, persistência e integridade dos dados. Regras críticas não devem existir apenas no frontend.

### Diretrizes para Componentes

- Separar componentes por responsabilidade, complexidade e ritmo de mudança, não apenas pela possibilidade de reutilização.
- Um componente usado uma única vez pode permanecer separado quando isola um bloco visual ou comportamental coeso e reduz a complexidade do componente pai.
- Evitar criar um arquivo para cada fragmento pequeno de JSX. Subcomponentes privados e curtos devem permanecer no mesmo arquivo do componente principal enquanto isso preservar a leitura.
- Não usar limites rígidos de linhas. Dividir quando existirem regiões semânticas independentes, estados ou efeitos diferentes, ou dificuldade concreta de navegação.
- Componentes com composição fixa devem controlar seus próprios filhos. Evitar `children` quando não existir necessidade real de extensão ou variação.
- Preferir nomes semânticos ligados ao produto e à interface, em vez de nomes baseados em `divs` ou na estrutura do Figma.
- Manter Server Components por padrão. Adicionar `"use client"` somente para estado, eventos com comportamento, hooks do cliente ou APIs do navegador.
- Aparência interativa deve corresponder a comportamento e semântica. Usar `button`, `a` ou `Link`, com teclado e foco visível, para controles reais.
- Extrair dados e textos apenas quando forem repetidos, extensos, dinâmicos ou consumidos por mais de um componente.
- Isolar valores absolutos necessários para mockups do Figma dentro do componente do mockup. Subcomponentes privados podem representar header, busca, artigo e tópicos sem espalhar a composição por muitos arquivos.
- Repetições visuais relevantes devem evoluir para tokens ou variantes compartilhadas. Evitar abstrações antecipadas para classes usadas uma única vez.

Critério principal: modularidade deve reduzir carga cognitiva, explicitar dependências e localizar mudanças. Mais pastas e arquivos, por si só, não significam uma arquitetura melhor.

## Figma MCP

O usuário quer integrar componentes do Figma via MCP.

Foi feito login OAuth:

```powershell
codex mcp login figma
```

Depois do login, `codex mcp list` passou a mostrar o Figma com auth `OAuth`.

Mesmo assim, a ferramenta MCP integrada ainda falhou no handshake dentro da sessão:

```text
Unexpected content type: missing-content-type
```

Conclusão: autenticação foi feita, mas a sessão do Codex/MCP provavelmente precisa ser reiniciada para recarregar a conexão.

Quando funcionar, pedir ao usuário a URL do arquivo/componente do Figma, preferencialmente com `node-id`.

## Comandos de Validação Úteis

Server:

```powershell
npm run check-types
```

rodando dentro de:

```text
apps/server
```

DB:

```powershell
npx tsc -p packages/db/tsconfig.json --noEmit
npm run db:generate
npm run db:migrate
```

Web:

```powershell
npm run build
npm run dev
```

rodando dentro de:

```text
apps/web
```

Monorepo:

```powershell
npm run check-types
```

Observação: em uma execução anterior, o Turbo marcou `@arxio/ui` como falha sem exibir erro, mas `npm run check-types` dentro de `packages/ui` passou isoladamente. Investigar separado se isso reaparecer.

## Cuidados

- Não reverter mudanças do usuário sem pedido explícito.
- Não misturar PRs diferentes sem necessidade.
- Antes de criar uma branch nova, atualizar `main` com:

```powershell
git pull --ff-only origin main
```

- Seguir o padrão de branch observado no projeto:

```text
<numero>-descricao-curta
```

Exemplos:

```text
8-improve-users-module-readme
9-create-homepage
```

- Seguir Conventional Commits simples:

```text
feat:
fix:
docs:
refactor:
test:
build:
```

- Não incluir `Co-authored-by` em commits.
