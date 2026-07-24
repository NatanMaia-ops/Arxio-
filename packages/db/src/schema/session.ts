import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./user";

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
