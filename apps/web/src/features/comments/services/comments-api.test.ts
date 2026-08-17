import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	createComment,
	deleteComment,
	fetchComments,
	updateComment,
} from "./comments-api";

type RecordedRequest = {
	input: RequestInfo | URL;
	init?: RequestInit;
};

const articleId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";

const commentPayload = {
	id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
	articleId,
	authorId: "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
	parentId: null,
	content: "Comentario de teste",
	createdAt: "2026-07-20T12:00:00.000Z",
	updatedAt: "2026-07-20T12:00:00.000Z",
};

function recorder(response: () => Response) {
	const requests: RecordedRequest[] = [];
	const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ input, init });
		return response();
	};

	return { requests, fetcher };
}

describe("Comments API", () => {
	it("fetches comments with credentials and no cache", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json([commentPayload]),
		);

		const comments = await fetchComments(
			"http://localhost:3000/",
			articleId,
			fetcher,
		);

		assert.equal(comments.length, 1);
		assert.equal(comments[0]?.content, commentPayload.content);
		assert.ok(comments[0]?.createdAt instanceof Date);
		assert.equal(
			requests[0]?.input,
			`http://localhost:3000/articles/${articleId}/comments`,
		);
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(requests[0]?.init?.cache, "no-store");
	});

	it("rejects a malformed comments response", async () => {
		const fetcher = async () => Response.json([{ id: "not-a-uuid" }]);

		await assert.rejects(
			fetchComments("http://localhost:3000", articleId, fetcher),
			/Invalid comments response/,
		);
	});

	it("reports a failed comments request", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await assert.rejects(
			fetchComments("http://localhost:3000", articleId, fetcher),
			/Failed to fetch comments/,
		);
	});

	it("creates a root comment", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(JSON.stringify(commentPayload), { status: 201 }),
		);

		const comment = await createComment(
			"http://localhost:3000",
			articleId,
			{ content: commentPayload.content },
			fetcher,
		);

		assert.equal(comment.id, commentPayload.id);
		assert.equal(requests[0]?.init?.method, "POST");
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({ content: commentPayload.content }),
		);
	});

	it("creates a reply with a parentId", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(JSON.stringify(commentPayload), { status: 201 }),
		);

		await createComment(
			"http://localhost:3000",
			articleId,
			{ content: "Resposta", parentId: commentPayload.id },
			fetcher,
		);

		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({ content: "Resposta", parentId: commentPayload.id }),
		);
	});

	it("surfaces the server message when creation fails", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "NOT_FOUND", message: "Artigo nao encontrado" },
				{ status: 404 },
			);

		await assert.rejects(
			createComment(
				"http://localhost:3000",
				articleId,
				{ content: "Comentario" },
				fetcher,
			),
			/Artigo nao encontrado/,
		);
	});

	it("updates a comment", async () => {
		const { requests, fetcher } = recorder(() => Response.json(commentPayload));

		await updateComment(
			"http://localhost:3000",
			commentPayload.id,
			"Atualizado",
			fetcher,
		);

		assert.equal(requests[0]?.init?.method, "PATCH");
		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({ content: "Atualizado" }),
		);
	});

	it("reports a forbidden update", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "FORBIDDEN", message: "Voce nao tem permissao" },
				{ status: 403 },
			);

		await assert.rejects(
			updateComment(
				"http://localhost:3000",
				commentPayload.id,
				"Atualizado",
				fetcher,
			),
			/Voce nao tem permissao/,
		);
	});

	it("deletes a comment", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(null, { status: 204 }),
		);

		await deleteComment("http://localhost:3000", commentPayload.id, fetcher);

		assert.equal(requests[0]?.init?.method, "DELETE");
		assert.equal(requests[0]?.init?.credentials, "include");
	});

	it("treats deleting an already removed comment as success", async () => {
		const fetcher = async () => new Response(null, { status: 404 });

		await deleteComment("http://localhost:3000", commentPayload.id, fetcher);
	});
});
