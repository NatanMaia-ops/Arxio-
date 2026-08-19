import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
