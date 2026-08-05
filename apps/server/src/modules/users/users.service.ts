import { hash } from "bcryptjs";

import { ConflictError, NotFoundError } from "../../shared/errors";

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
	constructor(private readonly users: UserRepository) {}

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

		return profile;
	}

	async getOwnAccount(authenticatedUserId: string): Promise<OwnUserAccount> {
		const account = await this.users.findOwnAccountById(authenticatedUserId);

		if (!account) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		return account;
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

		return account;
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
			avatarUrl: user.avatarUrl,
			emailVerifiedAt: user.emailVerifiedAt,
			student: null,
			createdAt: user.createdAt,
		};
	}
}
