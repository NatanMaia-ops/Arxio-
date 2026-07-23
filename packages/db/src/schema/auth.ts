import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user";

export const accounts = pgTable(
	"accounts",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(table) => [
		primaryKey({ columns: [table.provider, table.providerAccountId] }),
		index("accounts_user_id_idx").on(table.userId),
	],
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export const sessions = pgTable(
	"sessions",
	{
		sessionToken: text("session_token").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expires: timestamp("expires").notNull(),
	},
	(table) => [index("sessions_user_id_idx").on(table.userId)],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const verificationTokens = pgTable(
	"verification_tokens",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires").notNull(),
	},
	(table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
