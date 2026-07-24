import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";

import { roles } from "./role";
import { users } from "./user";

export const userRoles = pgTable(
	"user_roles",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id),

		roleId: uuid("role_id")
			.notNull()
			.references(() => roles.id),

		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({
			columns: [table.userId, table.roleId],
		}),
	],
);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
