import type { AdapterAccount, AdapterUser } from "@auth/core/adapters";

import { ConflictError, NotFoundError } from "../../shared/errors";

import type { AuthRepository } from "./repositories/auth-repository";

export class AuthService {
	constructor(private readonly repository: AuthRepository) {}

	async createUserFromOAuth(profile: AdapterUser): Promise<AdapterUser> {
		const email = profile.email.trim().toLowerCase();
		const existingUser = await this.repository.getUserByEmail(email);

		if (existingUser) return existingUser;

		return this.repository.createUser({
			...profile,
			email,
		});
	}

	async linkAccount(account: AdapterAccount): Promise<void> {
		const linkedUser = await this.repository.getUserByAccount({
			provider: account.provider,
			providerAccountId: account.providerAccountId,
		});

		if (linkedUser?.id === account.userId) return;

		if (linkedUser) {
			throw new ConflictError("Conta social ja vinculada a outro usuario");
		}

		const user = await this.repository.getUser(account.userId);

		if (!user) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		await this.repository.linkAccount(account);
	}
}
