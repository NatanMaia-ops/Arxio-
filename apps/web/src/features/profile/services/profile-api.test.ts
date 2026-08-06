import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { editProfileSchema } from "../schemas/profile.schema";
import {
	fetchOwnAccount,
	fetchPublicProfileById,
	ProfileApiError,
	updateOwnProfile,
} from "./profile-api";

type RecordedRequest = {
	input: RequestInfo | URL;
	init?: RequestInit;
};

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const profilePayload = {
	id: userId,
	name: "Lucas Lima",
	bio: "Estudante e pesquisador",
	avatarUrl: null,
	academicProfile: {
		course: "Ciência da Computação",
		semester: 4,
		institution: null,
	},
	createdAt: "2026-08-05T12:00:00.000Z",
};
const ownAccountPayload = {
	...profilePayload,
	email: "lucas@example.com",
};

function recorder(response: () => Response) {
	const requests: RecordedRequest[] = [];
	const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ input, init });
		return response();
	};

	return { requests, fetcher };
}

async function rejectsWithKind(
	request: Promise<unknown>,
	kind: ProfileApiError["kind"],
	status?: number,
) {
	await assert.rejects(request, (error: unknown) => {
		assert.ok(error instanceof ProfileApiError);
		assert.equal(error.kind, kind);
		assert.equal(error.status, status);
		return true;
	});
}

describe("Profile API", () => {
	it("fetches and validates a public profile", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json({ ...profilePayload, privateField: "ignored" }),
		);

		const profile = await fetchPublicProfileById(
			"http://localhost:3000/",
			userId,
			fetcher,
		);

		assert.equal(profile?.id, userId);
		assert.ok(profile?.createdAt instanceof Date);
		assert.equal("privateField" in (profile ?? {}), false);
		assert.equal(
			requests[0]?.input,
			`http://localhost:3000/users/${userId}/profile`,
		);
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(requests[0]?.init?.cache, "no-store");
	});

	it("accepts a public profile without academic information", async () => {
		const fetcher = async () =>
			Response.json({ ...profilePayload, academicProfile: null });

		const profile = await fetchPublicProfileById(
			"http://localhost:3000",
			userId,
			fetcher,
		);

		assert.equal(profile?.academicProfile, null);
	});

	it("returns null only when the public profile is missing", async () => {
		const fetcher = async () => new Response(null, { status: 404 });

		assert.equal(
			await fetchPublicProfileById("http://localhost:3000", userId, fetcher),
			null,
		);
	});

	it("distinguishes a temporary public-profile failure", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await rejectsWithKind(
			fetchPublicProfileById("http://localhost:3000", userId, fetcher),
			"request_failed",
			503,
		);
	});

	it("fetches and validates the authenticated account", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json(ownAccountPayload),
		);

		const account = await fetchOwnAccount("http://localhost:3000", fetcher);

		assert.equal(account.email, ownAccountPayload.email);
		assert.ok(account.createdAt instanceof Date);
		assert.equal(requests[0]?.input, "http://localhost:3000/users/me");
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(requests[0]?.init?.cache, "no-store");
	});

	it("distinguishes missing authentication from a missing own account", async () => {
		const unauthorized = async () =>
			Response.json(
				{ code: "UNAUTHORIZED", message: "Authentication required" },
				{ status: 401 },
			);
		const missing = async () =>
			Response.json(
				{ code: "NOT_FOUND", message: "Usuario nao encontrado" },
				{ status: 404 },
			);

		await rejectsWithKind(
			fetchOwnAccount("http://localhost:3000", unauthorized),
			"unauthorized",
			401,
		);
		await rejectsWithKind(
			fetchOwnAccount("http://localhost:3000", missing),
			"not_found",
			404,
		);
	});

	it("rejects a successful response outside the account contract", async () => {
		const fetcher = async () =>
			Response.json({ ...profilePayload, email: null });

		await rejectsWithKind(
			fetchOwnAccount("http://localhost:3000", fetcher),
			"invalid_response",
			200,
		);
	});

	it("rejects malformed JSON in a successful response", async () => {
		const fetcher = async () =>
			new Response("not-json", {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});

		await rejectsWithKind(
			fetchOwnAccount("http://localhost:3000", fetcher),
			"invalid_response",
			200,
		);
	});

	it("updates the own profile with normalized form data", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json({
				...ownAccountPayload,
				name: "Lucas Atualizado",
				bio: null,
			}),
		);
		const input = editProfileSchema.parse({
			name: " Lucas Atualizado ",
			bio: " ",
			semester: "5",
		});

		const account = await updateOwnProfile(
			"http://localhost:3000",
			input,
			fetcher,
		);

		assert.equal(account.name, "Lucas Atualizado");
		assert.equal(requests[0]?.input, "http://localhost:3000/users/me");
		assert.equal(requests[0]?.init?.method, "PATCH");
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(
			requests[0]?.init?.headers &&
				new Headers(requests[0].init.headers).get("Content-Type"),
			"application/json",
		);
		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({
				name: "Lucas Atualizado",
				bio: null,
				semester: 5,
			}),
		);
	});

	it("classifies an unauthorized update", async () => {
		const fetcher = async () => new Response(null, { status: 401 });

		await rejectsWithKind(
			updateOwnProfile(
				"http://localhost:3000",
				{ name: "Lucas Atualizado" },
				fetcher,
			),
			"unauthorized",
			401,
		);
	});

	it("classifies network failures", async () => {
		const fetcher = async (): Promise<Response> => {
			throw new TypeError("network unavailable");
		};

		await rejectsWithKind(
			fetchOwnAccount("http://localhost:3000", fetcher),
			"request_failed",
		);
	});
});
