# Banco de dados — antes e depois

## Antes

`packages/db/src/schema/comment.ts`

```ts
export const comments = pgTable(
	"comments",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		articleId: uuid("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),

		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
			onDelete: "cascade",
		}),

		content: text("content").notNull(),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("comments_article_id_idx").on(table.articleId),
		index("comments_parent_id_idx").on(table.parentId),
	],
);
```

Só existe `parentId`, apontando pra qualquer outro comentário — sem limite de quantas vezes isso se repete.

## Depois

Adiciona dois campos novos, só pra guardar "quem essa resposta está respondendo de verdade" (pra escrever o `@nome` na tela). Eles não servem pra organizar nível nenhum, é só informação de exibição.

```ts
export const comments = pgTable(
	"comments",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		articleId: uuid("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),

		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
			onDelete: "cascade",
		}),

		replyToCommentId: uuid("reply_to_comment_id").references(
			(): AnyPgColumn => comments.id,
			{ onDelete: "set null" },
		),

		replyToAuthorId: uuid("reply_to_author_id").references(() => users.id, {
			onDelete: "set null",
		}),

		content: text("content").notNull(),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("comments_article_id_idx").on(table.articleId),
		index("comments_parent_id_idx").on(table.parentId),
	],
);
```

`parentId` continua existindo, mas a regra de negócio (ver [antes-e-depois-servidor.md](./antes-e-depois-servidor.md)) garante que ele nunca aponta pra outra resposta — só pra um comentário raiz.
