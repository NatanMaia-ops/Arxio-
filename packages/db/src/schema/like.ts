import {
	pgTable,
	timestamp,
	uuid,
	index,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { articles } from "./article";
import { users } from "./user";

export const likes = pgTable(
	"likes",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		articleId: uuid("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),

		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		createdAt: timestamp("created_at").notNull().defaultNow(),
	},

	(table) => [
		index("likes_article_id_idx").on(table.articleId),
		uniqueIndex("likes_article_id_user_id_unique").on(
			table.articleId,
			table.userId,
		),
	],
);

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
