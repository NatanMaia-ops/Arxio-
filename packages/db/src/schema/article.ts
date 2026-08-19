import {
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const articles = pgTable(
	"articles",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		title: varchar("title", { length: 200 }).notNull(),
		content: text("content").notNull(),
		status: varchar("status", { length: 20 }).notNull().default("published"),
		coverObjectKey: varchar("cover_object_key", { length: 500 }),
		coverFit: varchar("cover_fit", { length: 10 })
			.$type<"cover" | "contain">()
			.notNull()
			.default("cover"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("articles_author_id_idx").on(table.authorId),
		index("articles_status_idx").on(table.status),
	],
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
