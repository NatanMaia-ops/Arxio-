import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchLikesStatus, likeArticle, unlikeArticle } from "./likes-api";

type RecordedRequest = {
	input: RequestInfo | URL;
	init?: RequestInit;
};

const articleId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";

function recorder(response: () => Response) {
	const requests: RecordedRequest[] = [];
	const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ input, init });
		return response();
	};

	return { requests, fetcher };
}

describe("Likes API", () => {
	it("fetches the likes status with credentials and no cache", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json({ count: 3, likedByMe: true }),
		);

		const status = await fetchLikesStatus(
			"http://localhost:3000/",
			articleId,
			fetcher,
		);

		assert.deepEqual(status, { count: 3, likedByMe: true });
		assert.equal(
			requests[0]?.input,
			`http://localhost:3000/articles/${articleId}/likes`,
		);
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(requests[0]?.init?.cache, "no-store");
	});

	it("rejects a malformed likes status response", async () => {
		const fetcher = async () => Response.json({ count: "not-a-number" });

		await assert.rejects(
			fetchLikesStatus("http://localhost:3000", articleId, fetcher),
			/Invalid likes status response/,
		);
	});

	it("reports a failed status request", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await assert.rejects(
			fetchLikesStatus("http://localhost:3000", articleId, fetcher),
			/Failed to fetch likes status/,
		);
	});

	it("likes an article", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(null, { status: 201 }),
		);

		await likeArticle("http://localhost:3000", articleId, fetcher);

		assert.equal(requests[0]?.init?.method, "POST");
		assert.equal(requests[0]?.init?.credentials, "include");
	});

	it("treats liking an already liked article as success", async () => {
		const fetcher = async () => new Response(null, { status: 409 });

		await likeArticle("http://localhost:3000", articleId, fetcher);
	});

	it("surfaces the server message when liking fails", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "UNAUTHORIZED", message: "Authentication required" },
				{ status: 401 },
			);

		await assert.rejects(
			likeArticle("http://localhost:3000", articleId, fetcher),
			/Authentication required/,
		);
	});

	it("unlikes an article", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(null, { status: 204 }),
		);

		await unlikeArticle("http://localhost:3000", articleId, fetcher);

		assert.equal(requests[0]?.init?.method, "DELETE");
		assert.equal(requests[0]?.init?.credentials, "include");
	});

	it("treats unliking an already unliked article as success", async () => {
		const fetcher = async () => new Response(null, { status: 404 });

		await unlikeArticle("http://localhost:3000", articleId, fetcher);
	});
});
