import { db } from "@arxio/db";
import { users } from "@arxio/db/schema/user";
import { eq } from "drizzle-orm";

import type { User, UserWithPasswordHash } from "../../entities/user.entity";
import type {
	CreateUserInput,
	UpdateUserInput,
	UserRepository,
} from "../../repositories/user-repository";

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

	async findByEmail(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		return user ? toUser(user) : null;
	},

	async findByEmailWithPasswordHash(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));

		return user ? toUserWithPasswordHash(user) : null;
	},

	async update(id: string, input: UpdateUserInput) {
		const [user] = await db
			.update(users)
			.set({
				name: input.name,
				bio: input.bio,
				image: input.avatarUrl,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		return user ? toUser(user) : null;
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
