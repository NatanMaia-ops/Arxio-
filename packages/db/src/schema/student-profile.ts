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

		enrollmentNumber: varchar("enrollment_number", { length: 50 })
			.notNull()
			.unique(),

		course: varchar("course", { length: 150 }),
		semester: integer("semester"),

		enrollmentVerifiedAt: timestamp("enrollment_verified_at"),
		verificationMethod: varchar("verification_method", { length: 30 }),

		verifiedBy: uuid("verified_by").references(() => users.id),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},

	(table) => [
		index("student_profiles_user_id_idx").on(table.userId),
		index("student_profiles_enrollment_number_idx").on(table.enrollmentNumber),
	],
);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
