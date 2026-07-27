import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchAuthorSummary } from "./authors-api";

const authorId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";

describe("Authors API", () => {
	it("keeps only the fields needed to credit an author", async () => {
		const fetcher = async () =>
			Response.json({
				id: authorId,
				name: "Marina Costa",
				email: "marina@example.com",
				bio: "Escreve sobre produto",
				avatarUrl: null,
				emailVerifiedAt: null,
				student: null,
				createdAt: "2026-07-20T12:00:00.000Z",
			});

		assert.deepEqual(
			await fetchAuthorSummary("http://localhost:3000", authorId, fetcher),
			{ id: authorId, name: "Marina Costa", avatarUrl: null },
		);
	});

	it("returns null when the author no longer exists", async () => {
		const fetcher = async () => new Response(null, { status: 404 });

		assert.equal(
			await fetchAuthorSummary("http://localhost:3000", authorId, fetcher),
			null,
		);
	});

	it("reports a failed author request", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await assert.rejects(
			fetchAuthorSummary("http://localhost:3000", authorId, fetcher),
			/Failed to fetch author/,
		);
	});
});
