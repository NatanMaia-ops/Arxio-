import {
	index,
	integer,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./user";

export const studentProfiles = pgTable(
	"student_profiles",
	{
		id: uuid("id").primaryKey().defaultRandom(),

		userId: uuid("user_id")
			.notNull()
			.unique()
			.references(() => users.id),

		course: varchar("course", { length: 150 }),
		semester: integer("semester"),
		institution: varchar("institution", { length: 150 }),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},

	(table) => [index("student_profiles_user_id_idx").on(table.userId)],
);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
