import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: varchar("name", { length: 50 }).notNull().unique(),
	description: varchar("description", { length: 255 }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
