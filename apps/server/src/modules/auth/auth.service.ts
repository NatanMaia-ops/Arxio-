import type { Adapter, AdapterAccount, AdapterUser } from "@auth/core/adapters";
import type { Session } from "@auth/express";
import type { Request } from "express";

import { ConflictError, NotFoundError } from "../../shared/errors";

export type AuthPersistence = Required<
	Pick<
		Adapter,
		| "createUser"
		| "getUser"
		| "getUserByAccount"
		| "getUserByEmail"
		| "linkAccount"
	>
>;

export type SessionReader = (request: Request) => Promise<Session | null>;

export class AuthService {
	constructor(
		private readonly persistence: AuthPersistence,
		private readonly sessionReader: SessionReader,
	) {}

	async createUserFromOAuth(profile: AdapterUser): Promise<AdapterUser> {
		const email = profile.email.trim().toLowerCase();
		const existingUser = await this.persistence.getUserByEmail(email);

		if (existingUser) return existingUser;

		return this.persistence.createUser({
			...profile,
			email,
		});
	}

	async linkAccount(account: AdapterAccount): Promise<void> {
		const linkedUser = await this.persistence.getUserByAccount({
			provider: account.provider,
			providerAccountId: account.providerAccountId,
		});

		if (linkedUser?.id === account.userId) return;

		if (linkedUser) {
			throw new ConflictError("Conta social ja vinculada a outro usuario");
		}

		const user = await this.persistence.getUser(account.userId);

		if (!user) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		await this.persistence.linkAccount(account);
	}

	async getSession(request: Request): Promise<Session | null> {
		return this.sessionReader(request);
	}
}
