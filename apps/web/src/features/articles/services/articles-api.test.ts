import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	createArticle,
	deleteArticle,
	fetchArticleById,
	fetchArticles,
	updateArticle,
} from "./articles-api";

type RecordedRequest = {
	input: RequestInfo | URL;
	init?: RequestInit;
};

const articlePayload = {
	id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
	authorId: "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
	title: "Como pequenas escolhas moldam produtos melhores",
	content: '{"type":"doc","content":[]}',
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

describe("Articles API", () => {
	it("lists articles with credentials and no cache", async () => {
		const { requests, fetcher } = recorder(() =>
			Response.json([articlePayload]),
		);

		const articles = await fetchArticles("http://localhost:3000/", fetcher);

		assert.equal(articles.length, 1);
		assert.equal(articles[0]?.title, articlePayload.title);
		assert.ok(articles[0]?.createdAt instanceof Date);
		assert.equal(requests[0]?.input, "http://localhost:3000/articles");
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(requests[0]?.init?.cache, "no-store");
	});

	it("rejects a list response outside the contract", async () => {
		const fetcher = async () => Response.json([{ id: "not-a-uuid" }]);

		await assert.rejects(
			fetchArticles("http://localhost:3000", fetcher),
			/Invalid articles response/,
		);
	});

	it("reports a failed list request", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await assert.rejects(
			fetchArticles("http://localhost:3000", fetcher),
			/Failed to fetch articles/,
		);
	});

	it("fetches one article by id", async () => {
		const { requests, fetcher } = recorder(() => Response.json(articlePayload));

		const article = await fetchArticleById(
			"http://localhost:3000",
			articlePayload.id,
			fetcher,
		);

		assert.equal(article?.id, articlePayload.id);
		assert.equal(
			requests[0]?.input,
			`http://localhost:3000/articles/${articlePayload.id}`,
		);
	});

	it("returns null for a missing or malformed article id", async () => {
		const missing = async () => new Response(null, { status: 404 });
		const malformed = async () => new Response(null, { status: 400 });

		assert.equal(
			await fetchArticleById("http://localhost:3000", "any", missing),
			null,
		);
		assert.equal(
			await fetchArticleById("http://localhost:3000", "any", malformed),
			null,
		);
	});

	it("creates an article without sending an author", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(JSON.stringify(articlePayload), { status: 201 }),
		);

		const article = await createArticle(
			"http://localhost:3000",
			{ title: articlePayload.title, content: articlePayload.content },
			fetcher,
		);

		assert.equal(article.id, articlePayload.id);
		assert.equal(requests[0]?.init?.method, "POST");
		assert.equal(requests[0]?.init?.credentials, "include");
		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({
				title: articlePayload.title,
				content: articlePayload.content,
			}),
		);
	});

	it("surfaces the server message when creation fails", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "UNAUTHORIZED", message: "Authentication required" },
				{ status: 401 },
			);

		await assert.rejects(
			createArticle(
				"http://localhost:3000",
				{ title: "titulo", content: "conteudo" },
				fetcher,
			),
			/Authentication required/,
		);
	});

	it("falls back to a default message when the error body is unreadable", async () => {
		const fetcher = async () => new Response("<html>", { status: 500 });

		await assert.rejects(
			createArticle(
				"http://localhost:3000",
				{ title: "titulo", content: "conteudo" },
				fetcher,
			),
			/Não foi possível publicar o artigo/,
		);
	});

	it("updates an article with a partial payload", async () => {
		const { requests, fetcher } = recorder(() => Response.json(articlePayload));

		await updateArticle(
			"http://localhost:3000",
			articlePayload.id,
			{ title: "Novo título" },
			fetcher,
		);

		assert.equal(requests[0]?.init?.method, "PATCH");
		assert.equal(
			requests[0]?.init?.body,
			JSON.stringify({ title: "Novo título" }),
		);
	});

	it("deletes an article", async () => {
		const { requests, fetcher } = recorder(
			() => new Response(null, { status: 204 }),
		);

		await deleteArticle("http://localhost:3000", articlePayload.id, fetcher);

		assert.equal(requests[0]?.init?.method, "DELETE");
		assert.equal(requests[0]?.init?.credentials, "include");
	});

	it("treats deleting an already removed article as success", async () => {
		const fetcher = async () => new Response(null, { status: 404 });

		await deleteArticle("http://localhost:3000", articlePayload.id, fetcher);
	});

	it("reports a forbidden delete", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "FORBIDDEN", message: "Voce nao tem permissao" },
				{ status: 403 },
			);

		await assert.rejects(
			deleteArticle("http://localhost:3000", articlePayload.id, fetcher),
			/Voce nao tem permissao/,
		);
	});
});
