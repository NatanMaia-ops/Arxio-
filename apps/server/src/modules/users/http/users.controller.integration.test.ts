import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";

import { NotFoundError } from "../../../shared/errors";
import { errorHandler } from "../../../shared/http/error-handler";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import type { OwnUserAccount } from "../entities/own-user-account.entity";
import type { PublicUserProfile } from "../entities/public-user-profile.entity";
import type { UpdateOwnProfileInput } from "../repositories/user-repository";
import type { UsersService } from "../users.service";

import { createUsersController } from "./users.controller";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const missingUserId = "b1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const createdAt = new Date("2026-08-05T12:00:00.000Z");

const publicProfile: PublicUserProfile = {
	id: userId,
	name: "Lucas Lima",
	bio: "Estudante e pesquisador",
	avatarUrl: "https://example.com/avatar.png",
	academicProfile: {
		course: "Ciência da Computação",
		semester: 4,
		institution: "UEPB",
	},
	createdAt,
};

const ownAccount: OwnUserAccount = {
	...publicProfile,
	email: "lucas@example.com",
};

type ControllerService = Pick<
	UsersService,
	| "createUser"
	| "getUserById"
	| "getPublicProfileById"
	| "getOwnAccount"
	| "updateOwnProfile"
>;

describe("Users profile HTTP API", () => {
	let origin = "";
	let server: Server;
	let publicProfileCalls = 0;
	let receivedOwnAccountId: string | null = null;
	let receivedUpdateId: string | null = null;
	let receivedUpdateInput: UpdateOwnProfileInput | null = null;

	const service: ControllerService = {
		async createUser() {
			throw new Error("Not used in profile tests");
		},
		async getUserById() {
			return null;
		},
		async getPublicProfileById(id) {
			publicProfileCalls += 1;

			if (id === missingUserId) {
				throw new NotFoundError("Usuario nao encontrado");
			}

			return {
				...publicProfile,
				email: "must-not-leak@example.com",
				emailVerifiedAt: new Date("2026-08-05T11:00:00.000Z"),
			};
		},
		async getOwnAccount(id) {
			receivedOwnAccountId = id;
			return ownAccount;
		},
		async updateOwnProfile(id, input) {
			receivedUpdateId = id;
			receivedUpdateInput = input;

			return {
				...ownAccount,
				name: input.name ?? ownAccount.name,
				bio: input.bio === undefined ? ownAccount.bio : input.bio,
				academicProfile: input.academicProfile
					? {
							course:
								input.academicProfile.course === undefined
									? (ownAccount.academicProfile?.course ?? null)
									: input.academicProfile.course,
							semester:
								input.academicProfile.semester === undefined
									? (ownAccount.academicProfile?.semester ?? null)
									: input.academicProfile.semester,
							institution:
								input.academicProfile.institution === undefined
									? (ownAccount.academicProfile?.institution ?? null)
									: input.academicProfile.institution,
						}
					: ownAccount.academicProfile,
			};
		},
	};

	before(async () => {
		const app = express();
		const authenticated = createRequireAuth(async () => ({
			user: { id: userId },
			expires: new Date(Date.now() + 3600_000).toISOString(),
		}));
		const unauthenticated = createRequireAuth(async () => null);

		app.use(express.json());
		app.use("/users", createUsersController(service, authenticated));
		app.use(
			"/anonymous-users",
			createUsersController(service, unauthenticated),
		);
		app.use(errorHandler);

		server = await new Promise<Server>((resolve, reject) => {
			const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
			listener.once("error", reject);
		});

		const address = server.address();

		assert.ok(address && typeof address === "object");
		origin = `http://127.0.0.1:${address.port}`;
	});

	after(
		() =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			}),
	);

	it("returns a public profile without authentication or private fields", async () => {
		const response = await fetch(`${origin}/users/${userId}/profile`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			...publicProfile,
			createdAt: createdAt.toISOString(),
		});
	});

	it("validates the public profile UUID before calling the service", async () => {
		const callsBeforeRequest = publicProfileCalls;
		const response = await fetch(`${origin}/users/invalid-id/profile`);

		assert.equal(response.status, 400);
		assert.equal(publicProfileCalls, callsBeforeRequest);
		const body = (await response.json()) as { code: string };
		assert.equal(body.code, "VALIDATION_ERROR");
	});

	it("returns 404 when the public profile does not exist", async () => {
		const response = await fetch(`${origin}/users/${missingUserId}/profile`);

		assert.equal(response.status, 404);
		const body = (await response.json()) as { code: string };
		assert.equal(body.code, "NOT_FOUND");
	});

	it("requires authentication for own-account routes", async () => {
		const getResponse = await fetch(`${origin}/anonymous-users/me`);
		const patchResponse = await fetch(`${origin}/anonymous-users/me`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Lucas Atualizado" }),
		});

		assert.equal(getResponse.status, 401);
		assert.equal(patchResponse.status, 401);
	});

	it("gets the account using exclusively the authenticated user id", async () => {
		receivedOwnAccountId = null;
		const response = await fetch(`${origin}/users/me`);

		assert.equal(response.status, 200);
		assert.equal(receivedOwnAccountId, userId);
		assert.deepEqual(await response.json(), {
			...ownAccount,
			createdAt: createdAt.toISOString(),
		});
	});

	it("updates personal and academic fields using the session id", async () => {
		receivedUpdateId = null;
		receivedUpdateInput = null;
		const response = await fetch(`${origin}/users/me`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: " Lucas Atualizado ",
				bio: " ",
				course: " Sistemas de Informação ",
				semester: 5,
				institution: null,
			}),
		});

		assert.equal(response.status, 200);
		assert.equal(receivedUpdateId, userId);
		assert.deepEqual(receivedUpdateInput, {
			name: "Lucas Atualizado",
			bio: null,
			academicProfile: {
				course: "Sistemas de Informação",
				semester: 5,
				institution: null,
			},
		});
	});

	it("keeps omitted academic fields out of a partial update", async () => {
		receivedUpdateInput = null;
		const response = await fetch(`${origin}/users/me`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ course: null }),
		});

		assert.equal(response.status, 200);
		assert.deepEqual(receivedUpdateInput, {
			academicProfile: { course: null },
		});
	});

	it("rejects invalid profile update payloads", async () => {
		const invalidPayloads = [
			{},
			{ name: "L" },
			{ bio: "x".repeat(501) },
			{ course: "x".repeat(151) },
			{ institution: "x".repeat(151) },
			{ semester: 0 },
			{ semester: 21 },
			{ semester: 2.5 },
			{ email: "new@example.com" },
			{ avatarUrl: "https://example.com/new.png" },
			{ id: missingUserId },
			{ unknown: true },
		];

		for (const payload of invalidPayloads) {
			const response = await fetch(`${origin}/users/me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			assert.equal(response.status, 400, JSON.stringify(payload));
			const body = (await response.json()) as { code: string };
			assert.equal(body.code, "VALIDATION_ERROR");
		}
	});
});
