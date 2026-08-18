import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";

import { errorHandler } from "../../../shared/http/error-handler";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import type { OnboardingState } from "../entities/onboarding.entity";
import { OnboardingService } from "../onboarding.service";
import type { OnboardingRepository } from "../repositories/onboarding-repository";

import { createOnboardingController } from "./onboarding.controller";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";

function createFakeRepository(): OnboardingRepository {
	let state: OnboardingState = {
		completed: false,
		user: {
			name: "Lucas Lima",
			email: "lucas@example.com",
		},
		studentProfile: null,
	};

	return {
		async findByUserId(id) {
			return id === userId ? state : null;
		},
		async complete(id, input) {
			if (id !== userId) return { status: "user-not-found" };

			if (state.completed) {
				return {
					status: "already-completed",
					state,
				};
			}

			state = {
				completed: true,
				user: {
					...state.user,
					name: input.name,
				},
				studentProfile: {
					course: input.course,
					semester: input.semester,
					institution: input.institution,
				},
			};

			return {
				status: "completed",
				state,
			};
		},
	};
}

describe("Onboarding HTTP API", () => {
	let origin = "";
	let server: Server;

	before(async () => {
		const app = express();
		const service = new OnboardingService(createFakeRepository());
		const authenticated = createRequireAuth(async () => ({
			user: { id: userId },
			expires: new Date(Date.now() + 3600_000).toISOString(),
		}));

		app.use(express.json());
		app.use("/onboarding", createOnboardingController(service, authenticated));
		app.use(
			"/onboarding-noauth",
			createOnboardingController(
				service,
				createRequireAuth(async () => null),
			),
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

	it("requires authentication", async () => {
		const response = await fetch(`${origin}/onboarding-noauth`);

		assert.equal(response.status, 401);
	});

	it("returns an incomplete state before profile creation", async () => {
		const response = await fetch(`${origin}/onboarding`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			completed: false,
			user: {
				name: "Lucas Lima",
				email: "lucas@example.com",
			},
			studentProfile: null,
		});
	});

	it("validates the completion payload", async () => {
		const response = await fetch(`${origin}/onboarding`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "L",
				semester: 21,
			}),
		});

		assert.equal(response.status, 400);
		const body = (await response.json()) as { code: string };
		assert.equal(body.code, "VALIDATION_ERROR");
	});

	it("rejects partial academic data", async () => {
		const response = await fetch(`${origin}/onboarding`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Lucas Atualizado",
				course: "Ciência da Computação",
			}),
		});

		assert.equal(response.status, 400);
		const body = (await response.json()) as {
			code: string;
			issues: Array<{ path: string[] }>;
		};
		assert.equal(body.code, "VALIDATION_ERROR");
		assert.deepEqual(
			body.issues.map((issue) => issue.path),
			[["semester"], ["institution"]],
		);
	});

	it("completes onboarding and normalizes blank optional fields", async () => {
		const response = await fetch(`${origin}/onboarding`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: " Lucas Atualizado ",
				course: " ",
				institution: "",
			}),
		});

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			completed: true,
			user: {
				name: "Lucas Atualizado",
				email: "lucas@example.com",
			},
			studentProfile: {
				course: null,
				semester: null,
				institution: null,
			},
		});
	});

	it("rejects repeated onboarding completion", async () => {
		const response = await fetch(`${origin}/onboarding`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Outro Nome",
			}),
		});

		assert.equal(response.status, 409);
		const body = (await response.json()) as { code: string };
		assert.equal(body.code, "CONFLICT");
	});
});
