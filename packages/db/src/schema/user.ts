import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: varchar("name", { length: 150 }).notNull(),
	email: varchar("email", { length: 150 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }),

	bio: text("bio"),
	image: varchar("avatar_url", { length: 500 }),

	emailVerified: timestamp("email_verified_at"),
	lastLoginAt: timestamp("last_login_at"),

	disabledAt: timestamp("disabled_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const roles = pgTable("roles", {
	id: uuid("id").primaryKey().defaultRandom(),

	name: varchar("name", { length: 50 }).notNull().unique(),
	description: varchar("description", { length: 255 }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

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
