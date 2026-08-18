import type { OwnUserAccount } from "../entities/own-user-account.entity";
import type { PublicUserProfile } from "../entities/public-user-profile.entity";
import type { User, UserWithPasswordHash } from "../entities/user.entity";

export type CreateUserInput = {
	name: string;
	email: string;
	passwordHash: string;
	bio?: string | null;
	avatarUrl?: string | null;
	avatarObjectKey?: string | null;
};

export type UpdateOwnProfileInput = {
	name?: string;
	bio?: string | null;
	academicProfile?: {
		course?: string | null;
		semester?: number | null;
		institution?: string | null;
	};
};

export type UserRepository = {
	create(input: CreateUserInput): Promise<User>;
	findById(id: string): Promise<User | null>;
	findProfileById(id: string): Promise<PublicUserProfile | null>;
	findOwnAccountById(id: string): Promise<OwnUserAccount | null>;
	findByEmail(email: string): Promise<User | null>;
	findByEmailWithPasswordHash(
		email: string,
	): Promise<UserWithPasswordHash | null>;
	updateOwnProfile(
		authenticatedUserId: string,
		input: UpdateOwnProfileInput,
	): Promise<OwnUserAccount | null>;
	replaceAvatarObjectKey(
		authenticatedUserId: string,
		objectKey: string | null,
	): Promise<{
		account: OwnUserAccount;
		previousObjectKey: string | null;
	} | null>;
	updateLastLoginAt(id: string): Promise<void>;
	verifyEmail(id: string): Promise<void>;
	disable(id: string): Promise<void>;
};
