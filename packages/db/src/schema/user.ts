import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: varchar("name", { length: 150 }).notNull(),
	email: varchar("email", { length: 150 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),

	bio: text("bio"),
	avatarUrl: varchar("avatar_url", { length: 500 }),

	emailVerifiedAt: timestamp("email_verified_at"),
	lastLoginAt: timestamp("last_login_at"),

	disabledAt: timestamp("disabled_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
