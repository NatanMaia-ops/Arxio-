import type { User, UserWithPasswordHash } from "../entities/user.entity";

export type CreateUserInput = {
	name: string;
	email: string;
	passwordHash: string;
	bio?: string | null;
	avatarUrl?: string | null;
};

export type UpdateUserInput = {
	name?: string;
	bio?: string | null;
	avatarUrl?: string | null;
};

export type UserRepository = {
	create(input: CreateUserInput): Promise<User>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByEmailWithPasswordHash(
		email: string,
	): Promise<UserWithPasswordHash | null>;
	update(id: string, input: UpdateUserInput): Promise<User | null>;
	updateLastLoginAt(id: string): Promise<void>;
	verifyEmail(id: string): Promise<void>;
	disable(id: string): Promise<void>;
};
