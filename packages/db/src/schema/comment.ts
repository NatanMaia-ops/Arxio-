import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { articles } from "./article";
import { users } from "./user";

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

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
