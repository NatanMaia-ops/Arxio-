import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AdapterAccount, AdapterUser } from "@auth/core/adapters";
import type { Session } from "@auth/express";
import type { Request } from "express";

import { ConflictError, NotFoundError } from "../../shared/errors";

import {
	type AuthPersistence,
	AuthService,
	type SessionReader,
} from "./auth.service";

const oauthProfile: AdapterUser = {
	id: "google-profile-id",
	name: "Lucas",
	email: "Lucas@Gmail.com ",
	emailVerified: null,
	image: null,
};

const persistedUser: AdapterUser = {
	...oauthProfile,
	id: "45d0b82d-36b6-4df8-82ba-26f8eec1636f",
	email: "lucas@gmail.com",
};

const googleAccount: AdapterAccount = {
	userId: persistedUser.id,
	type: "oidc",
	provider: "google",
	providerAccountId: "google-account-id",
	access_token: "access-token",
	refresh_token: "refresh-token",
};

function createPersistence(
	overrides: Partial<AuthPersistence> = {},
): AuthPersistence {
	return {
		async createUser(user) {
			return user;
		},
		async getUser() {
			return persistedUser;
		},
		async getUserByAccount() {
			return null;
		},
		async getUserByEmail() {
			return null;
		},
		async linkAccount() {},
		...overrides,
	};
}

const emptySessionReader: SessionReader = async () => null;

describe("AuthService", () => {
	it("returns the existing user found by normalized OAuth email", async () => {
		let searchedEmail = "";
		let createCalled = false;
		const persistence = createPersistence({
			async createUser(user) {
				createCalled = true;
				return user;
			},
			async getUserByEmail(email) {
				searchedEmail = email;
				return persistedUser;
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		const user = await service.createUserFromOAuth(oauthProfile);

		assert.equal(searchedEmail, "lucas@gmail.com");
		assert.equal(user, persistedUser);
		assert.equal(createCalled, false);
	});

	it("creates an OAuth user with a normalized email", async () => {
		const createdUsers: AdapterUser[] = [];
		const persistence = createPersistence({
			async createUser(user) {
				createdUsers.push(user);
				return persistedUser;
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		const user = await service.createUserFromOAuth(oauthProfile);

		assert.equal(createdUsers[0]?.email, "lucas@gmail.com");
		assert.equal(user, persistedUser);
	});

	it("links the complete provider account to an existing user", async () => {
		const linkedAccounts: AdapterAccount[] = [];
		const persistence = createPersistence({
			async linkAccount(account) {
				linkedAccounts.push(account);
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		await service.linkAccount(googleAccount);

		assert.equal(linkedAccounts[0], googleAccount);
		assert.equal(linkedAccounts[0]?.refresh_token, "refresh-token");
	});

	it("does not insert an account already linked to the same user", async () => {
		let linkCalled = false;
		const persistence = createPersistence({
			async getUserByAccount() {
				return persistedUser;
			},
			async linkAccount() {
				linkCalled = true;
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		await service.linkAccount(googleAccount);

		assert.equal(linkCalled, false);
	});

	it("rejects an account linked to another user", async () => {
		const persistence = createPersistence({
			async getUserByAccount() {
				return {
					...persistedUser,
					id: "f8133664-c866-4c8c-bfe4-7c2ab92dce0e",
				};
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		await assert.rejects(service.linkAccount(googleAccount), ConflictError);
	});

	it("rejects an account link for an unknown user", async () => {
		const persistence = createPersistence({
			async getUser() {
				return null;
			},
		});
		const service = new AuthService(persistence, emptySessionReader);

		await assert.rejects(service.linkAccount(googleAccount), NotFoundError);
	});

	it("reads the session from the current request", async () => {
		const request = {} as Request;
		const session: Session = {
			expires: new Date(Date.now() + 60_000).toISOString(),
			user: {
				name: persistedUser.name,
				email: persistedUser.email,
			},
		};
		let receivedRequest: Request | null = null;
		const sessionReader: SessionReader = async (currentRequest) => {
			receivedRequest = currentRequest;
			return session;
		};
		const service = new AuthService(createPersistence(), sessionReader);

		const currentSession = await service.getSession(request);

		assert.equal(receivedRequest, request);
		assert.equal(currentSession, session);
	});
});
