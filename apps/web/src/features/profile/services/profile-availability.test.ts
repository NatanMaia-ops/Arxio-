import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkPublicProfileAvailability } from "./profile-availability";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";

describe("Public profile availability", () => {
	it("checks the public endpoint with HEAD and no cache", async () => {
		let recordedInput: RequestInfo | URL | undefined;
		let recordedInit: RequestInit | undefined;
		const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
			recordedInput = input;
			recordedInit = init;

			return new Response(null, { status: 200 });
		};

		const availability = await checkPublicProfileAvailability(
			"http://localhost:3000/",
			userId,
			fetcher,
		);

		assert.equal(availability, "available");
		assert.equal(
			recordedInput,
			`http://localhost:3000/users/${userId}/profile`,
		);
		assert.equal(recordedInit?.method, "HEAD");
		assert.equal(recordedInit?.cache, "no-store");
		assert.equal(
			new Headers(recordedInit?.headers).get("Accept"),
			"application/json",
		);
	});

	it("distinguishes a missing profile from a temporary failure", async () => {
		const missing = async () => new Response(null, { status: 404 });
		const unavailable = async () => new Response(null, { status: 503 });

		assert.equal(
			await checkPublicProfileAvailability(
				"http://localhost:3000",
				userId,
				missing,
			),
			"not_found",
		);
		assert.equal(
			await checkPublicProfileAvailability(
				"http://localhost:3000",
				userId,
				unavailable,
			),
			"unavailable",
		);
	});

	it("treats a network error as temporary unavailability", async () => {
		const fetcher = async (): Promise<Response> => {
			throw new TypeError("network unavailable");
		};

		assert.equal(
			await checkPublicProfileAvailability(
				"http://localhost:3000",
				userId,
				fetcher,
			),
			"unavailable",
		);
	});
});
