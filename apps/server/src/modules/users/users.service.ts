import { hash } from "bcryptjs";

import { ConflictError, NotFoundError } from "../../shared/errors";
import type { MediaService } from "../media/media.service";

import type { OwnUserAccount } from "./entities/own-user-account.entity";
import type { PublicUserProfile } from "./entities/public-user-profile.entity";
import type { User, UserWithPasswordHash } from "./entities/user.entity";
import type { CreateUserInput as CreateUserDtoInput } from "./http/dtos/create_user.dto";
import type { UserResponse } from "./http/dtos/user_response.dto";
import type {
	UpdateOwnProfileInput,
	UserRepository,
} from "./repositories/user-repository";

export class UsersService {
	constructor(
		private readonly users: UserRepository,
		private readonly media?: MediaService,
	) {}

	async createUser(input: CreateUserDtoInput): Promise<UserResponse> {
		const existing = await this.users.findByEmail(input.email);

		if (existing) {
			throw new ConflictError("E-mail ja cadastrado");
		}

		const passwordHash = await hash(input.password, 12);

		const user = await this.users.create({
			name: input.name,
			email: input.email,
			passwordHash,
		});

		return this.toResponse(user);
	}

	async getUserById(id: string): Promise<UserResponse | null> {
		const user = await this.users.findById(id);
		return user ? this.toResponse(user) : null;
	}

	async getPublicProfileById(id: string): Promise<PublicUserProfile> {
		const profile = await this.users.findProfileById(id);

		if (!profile) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		return this.withResolvedAvatar(profile);
	}

	async getOwnAccount(authenticatedUserId: string): Promise<OwnUserAccount> {
		const account = await this.users.findOwnAccountById(authenticatedUserId);

		if (!account) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		return this.withResolvedAvatar(account);
	}

	async getUserByEmail(email: string): Promise<UserResponse | null> {
		const user = await this.users.findByEmail(email);
		return user ? this.toResponse(user) : null;
	}

	async getUserWithPasswordByEmail(
		email: string,
	): Promise<UserWithPasswordHash | null> {
		return this.users.findByEmailWithPasswordHash(email);
	}

	async updateOwnProfile(
		authenticatedUserId: string,
		input: UpdateOwnProfileInput,
	): Promise<OwnUserAccount> {
		const account = await this.users.updateOwnProfile(
			authenticatedUserId,
			input,
		);

		if (!account) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		return this.withResolvedAvatar(account);
	}

	async setOwnAvatar(
		authenticatedUserId: string,
		pendingObjectKey: string,
	): Promise<OwnUserAccount> {
		const media = this.requireMedia();
		const objectKey = await media.promotePendingUpload({
			userId: authenticatedUserId,
			purpose: "avatar",
			pendingObjectKey,
			destinationOwnerId: authenticatedUserId,
		});

		try {
			const result = await this.users.replaceAvatarObjectKey(
				authenticatedUserId,
				objectKey,
			);

			if (!result) {
				throw new NotFoundError("Usuario nao encontrado");
			}

			await media.deleteBestEffort(result.previousObjectKey);
			return this.withResolvedAvatar(result.account);
		} catch (error) {
			await media.deleteBestEffort(objectKey);
			throw error;
		}
	}

	async removeOwnAvatar(authenticatedUserId: string): Promise<OwnUserAccount> {
		const result = await this.users.replaceAvatarObjectKey(
			authenticatedUserId,
			null,
		);

		if (!result) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		await this.media?.deleteBestEffort(result.previousObjectKey);
		return this.withResolvedAvatar(result.account);
	}

	async verifyUserEmail(id: string): Promise<void> {
		return this.users.verifyEmail(id);
	}

	async recordLogin(id: string): Promise<void> {
		return this.users.updateLastLoginAt(id);
	}

	async disableUser(id: string): Promise<void> {
		return this.users.disable(id);
	}

	private toResponse(user: User): UserResponse {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			bio: user.bio,
			avatarUrl: this.resolveAvatarUrl(user.avatarObjectKey, user.avatarUrl),
			emailVerifiedAt: user.emailVerifiedAt,
			student: null,
			createdAt: user.createdAt,
		};
	}

	private withResolvedAvatar<T extends PublicUserProfile>(profile: T): T {
		return {
			...profile,
			avatarUrl: this.resolveAvatarUrl(
				profile.avatarObjectKey,
				profile.avatarUrl,
			),
		};
	}

	private resolveAvatarUrl(
		objectKey: string | null,
		fallbackUrl: string | null,
	): string | null {
		if (!objectKey) return fallbackUrl;
		return this.requireMedia().publicUrl(objectKey);
	}

	private requireMedia(): MediaService {
		if (!this.media) {
			throw new Error("MediaService is required for avatar operations");
		}

		return this.media;
	}
}
