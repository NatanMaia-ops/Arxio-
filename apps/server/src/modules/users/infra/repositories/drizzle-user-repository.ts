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
		avatarUrl: row.avatarUrl,
		emailVerifiedAt: row.emailVerifiedAt,
		lastLoginAt: row.lastLoginAt,
		disabledAt: row.disabledAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

function toUserWithPasswordHash(
	row: typeof users.$inferSelect,
): UserWithPasswordHash {
	return {
		...toUser(row),
		passwordHash: row.passwordHash,
	};
}

export const drizzleUserRepository: UserRepository = {
	async create(input: CreateUserInput) {
		const [user] = await db.insert(users).values(input).returning();

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
				...input,
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
				emailVerifiedAt: new Date(),
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
