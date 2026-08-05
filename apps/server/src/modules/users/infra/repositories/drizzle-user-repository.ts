import { db } from "@arxio/db";
import { studentProfiles } from "@arxio/db/schema/student-profile";
import { users } from "@arxio/db/schema/user";
import { eq } from "drizzle-orm";

import type { User, UserWithPasswordHash } from "../../entities/user.entity";
import type {
	CreateUserInput,
	UpdateOwnProfileInput,
	UserRepository,
} from "../../repositories/user-repository";

import {
	toOwnUserAccount,
	toPublicUserProfile,
} from "./public-user-profile-mapper";

const ownAccountSelection = {
	user: {
		id: users.id,
		name: users.name,
		email: users.email,
		bio: users.bio,
		avatarUrl: users.image,
		createdAt: users.createdAt,
	},
	academicProfile: {
		course: studentProfiles.course,
		semester: studentProfiles.semester,
		institution: studentProfiles.institution,
	},
};

function toUser(row: typeof users.$inferSelect): User {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		bio: row.bio,
		avatarUrl: row.image,
		emailVerifiedAt: row.emailVerified,
		lastLoginAt: row.lastLoginAt,
		disabledAt: row.disabledAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

function toUserWithPasswordHash(
	row: typeof users.$inferSelect,
): UserWithPasswordHash | null {
	if (row.passwordHash === null) return null;

	return {
		...toUser(row),
		passwordHash: row.passwordHash,
	};
}

export const drizzleUserRepository: UserRepository = {
	async create(input: CreateUserInput) {
		const [user] = await db
			.insert(users)
			.values({
				name: input.name,
				email: input.email,
				passwordHash: input.passwordHash,
				bio: input.bio,
				image: input.avatarUrl,
			})
			.returning();

		if (!user) {
			throw new Error("Failed to create user");
		}

		return toUser(user);
	},

	async findById(id: string) {
		const [user] = await db.select().from(users).where(eq(users.id, id));

		return user ? toUser(user) : null;
	},

	async findProfileById(id: string) {
		const [profile] = await db
			.select({
				user: {
					id: users.id,
					name: users.name,
					bio: users.bio,
					avatarUrl: users.image,
					createdAt: users.createdAt,
				},
				academicProfile: {
					course: studentProfiles.course,
					semester: studentProfiles.semester,
					institution: studentProfiles.institution,
				},
			})
			.from(users)
			.leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
			.where(eq(users.id, id));

		return profile ? toPublicUserProfile(profile) : null;
	},

	async findOwnAccountById(id: string) {
		const [account] = await db
			.select(ownAccountSelection)
			.from(users)
			.leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
			.where(eq(users.id, id));

		return account ? toOwnUserAccount(account) : null;
	},

	async findByEmail(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		return user ? toUser(user) : null;
	},

	async findByEmailWithPasswordHash(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		return user ? toUserWithPasswordHash(user) : null;
	},

	async updateOwnProfile(
		authenticatedUserId: string,
		input: UpdateOwnProfileInput,
	) {
		return db.transaction(async (transaction) => {
			const [user] = await transaction
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, authenticatedUserId))
				.for("update");

			if (!user) return null;

			const userChanges: {
				name?: string;
				bio?: string | null;
			} = {};

			if (input.name !== undefined) userChanges.name = input.name;
			if (input.bio !== undefined) userChanges.bio = input.bio;

			if (Object.keys(userChanges).length > 0) {
				const [updatedUser] = await transaction
					.update(users)
					.set({
						...userChanges,
						updatedAt: new Date(),
					})
					.where(eq(users.id, authenticatedUserId))
					.returning({ id: users.id });

				if (!updatedUser) {
					throw new Error("Failed to update user profile");
				}
			}

			const academicInput = input.academicProfile;
			const academicChanges: {
				course?: string | null;
				semester?: number | null;
				institution?: string | null;
			} = {};

			if (academicInput?.course !== undefined) {
				academicChanges.course = academicInput.course;
			}
			if (academicInput?.semester !== undefined) {
				academicChanges.semester = academicInput.semester;
			}
			if (academicInput?.institution !== undefined) {
				academicChanges.institution = academicInput.institution;
			}

			if (Object.keys(academicChanges).length > 0) {
				const [existingAcademicProfile] = await transaction
					.select({ id: studentProfiles.id })
					.from(studentProfiles)
					.where(eq(studentProfiles.userId, authenticatedUserId));

				if (existingAcademicProfile) {
					const [updatedAcademicProfile] = await transaction
						.update(studentProfiles)
						.set({
							...academicChanges,
							updatedAt: new Date(),
						})
						.where(eq(studentProfiles.userId, authenticatedUserId))
						.returning({ id: studentProfiles.id });

					if (!updatedAcademicProfile) {
						throw new Error("Failed to update academic profile");
					}
				} else {
					const hasAcademicData = Object.values(academicChanges).some(
						(value) => value !== null,
					);

					if (hasAcademicData) {
						const [createdAcademicProfile] = await transaction
							.insert(studentProfiles)
							.values({
								userId: authenticatedUserId,
								...academicChanges,
							})
							.returning({ id: studentProfiles.id });

						if (!createdAcademicProfile) {
							throw new Error("Failed to create academic profile");
						}
					}
				}
			}

			const [account] = await transaction
				.select(ownAccountSelection)
				.from(users)
				.leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
				.where(eq(users.id, authenticatedUserId));

			if (!account) {
				throw new Error("Failed to load updated user profile");
			}

			return toOwnUserAccount(account);
		});
	},

	async updateLastLoginAt(id: string) {
		await db
			.update(users)
			.set({
				lastLoginAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(users.id, id));
	},

	async verifyEmail(id: string) {
		await db
			.update(users)
			.set({
				emailVerified: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(users.id, id));
	},

	async disable(id: string) {
		await db
			.update(users)
			.set({
				disabledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(users.id, id));
	},
};
