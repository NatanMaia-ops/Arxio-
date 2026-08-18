import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";

import { errorHandler } from "../../../shared/http/error-handler";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import { MediaService } from "../../media/media.service";
import type { ObjectStorage } from "../../media/object-storage";
import type { Article } from "../entities/article.entity";
import type { ArticleRepository } from "../repositories/article-repository";
import { ArticleService } from "../services/articles.service";

import { createArticlesController } from "./articles.controller";

const fakeUserId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const otherUserId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";

function createFakeRepository(): ArticleRepository {
	const store = new Map<string, Article>();

	return {
		async create(input) {
			const article: Article = {
				id: crypto.randomUUID(),
				authorId: input.authorId,
				title: input.title,
				content: input.content,
				coverObjectKey: null,
				coverUrl: null,
				coverFit: input.coverFit,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			store.set(article.id, article);

			return article;
		},
		async findById(id) {
			return store.get(id) ?? null;
		},
		async findAll(filters = {}) {
			const storedArticles = Array.from(store.values());

			return filters.authorId
				? storedArticles.filter(
						(article) => article.authorId === filters.authorId,
					)
				: storedArticles;
		},
		async update(id, input) {
			const article = store.get(id);

			if (!article) return null;

			const updated: Article = {
				...article,
				...(input.title !== undefined ? { title: input.title } : {}),
				...(input.content !== undefined ? { content: input.content } : {}),
				...(input.coverFit !== undefined ? { coverFit: input.coverFit } : {}),
				updatedAt: new Date(),
			};

			store.set(id, updated);

			return updated;
		},
		async replaceCoverObjectKey(id, objectKey) {
			const article = store.get(id);
			if (!article) return null;
			const previousObjectKey = article.coverObjectKey;
			const updated = { ...article, coverObjectKey: objectKey, coverUrl: null };
			store.set(id, updated);
			return { article: updated, previousObjectKey };
		},
		async delete(id) {
			store.delete(id);
		},
	};
}

const mediaStorage: ObjectStorage = {
	async createPresignedUpload() {
		throw new Error("not used");
	},
	async getMetadata() {
		return { contentType: "image/png", sizeBytes: 1024 };
	},
	async copy() {},
	async delete() {},
};

describe("Articles HTTP API", () => {
	let origin = "";
	let server: Server;
	const repository = createFakeRepository();
	const articlesService = new ArticleService(
		repository,
		new MediaService(mediaStorage, "https://media.example.com"),
	);

	before(async () => {
		const app = express();

		app.use(express.json());

		app.use(
			"/articles",
			createArticlesController(
				articlesService,
				createRequireAuth(async () => ({
					user: { id: fakeUserId },
					expires: new Date(Date.now() + 3600_000).toISOString(),
				})),
			),
		);

		app.use(
			"/articles-other",
			createArticlesController(
				articlesService,
				createRequireAuth(async () => ({
					user: { id: otherUserId },
					expires: new Date(Date.now() + 3600_000).toISOString(),
				})),
			),
		);

		app.use(
			"/articles-noauth",
			createArticlesController(
				articlesService,
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

	it("returns 401 on POST without authentication", async () => {
		const response = await fetch(`${origin}/articles-noauth`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Titulo", content: "Conteudo" }),
		});

		assert.equal(response.status, 401);
		assert.deepEqual(await response.json(), {
			code: "UNAUTHORIZED",
			message: "Authentication required",
		});
	});

	it("creates an article with authenticated POST", async () => {
		const response = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Meu primeiro artigo",
				content: "Conteudo do artigo",
			}),
		});

		assert.equal(response.status, 201);

		const body = (await response.json()) as Record<string, unknown>;

		assert.ok(body.id);
		assert.equal(body.authorId, fakeUserId);
		assert.equal(body.title, "Meu primeiro artigo");
		assert.equal(body.content, "Conteudo do artigo");
		assert.ok(body.createdAt);
		assert.ok(body.updatedAt);
	});

	it("returns 400 on POST with invalid body", async () => {
		const response = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "ab", content: "" }),
		});

		assert.equal(response.status, 400);

		const body = (await response.json()) as { code: string };

		assert.equal(body.code, "VALIDATION_ERROR");
	});

	it("lists all articles on GET /", async () => {
		const response = await fetch(`${origin}/articles`);

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<unknown>;

		assert.equal(Array.isArray(body), true);
		assert.ok(body.length >= 1);
	});

	it("lists only articles from the requested author", async () => {
		const ownArticleResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Artigo do autor principal",
				content: "Conteudo principal",
			}),
		});
		const otherArticleResponse = await fetch(`${origin}/articles-other`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Artigo de outro autor",
				content: "Outro conteudo",
			}),
		});

		assert.equal(ownArticleResponse.status, 201);
		assert.equal(otherArticleResponse.status, 201);

		const response = await fetch(`${origin}/articles?authorId=${otherUserId}`);
		const body = (await response.json()) as Array<{ authorId: string }>;

		assert.equal(response.status, 200);
		assert.ok(body.length >= 1);
		assert.ok(body.every((article) => article.authorId === otherUserId));
	});

	it("returns an empty list when the author has no articles", async () => {
		const authorWithoutArticles = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";
		const response = await fetch(
			`${origin}/articles?authorId=${authorWithoutArticles}`,
		);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), []);
	});

	it("returns 400 for an invalid authorId filter", async () => {
		const response = await fetch(`${origin}/articles?authorId=invalid-id`);

		assert.equal(response.status, 400);
		const body = (await response.json()) as { code: string };
		assert.equal(body.code, "VALIDATION_ERROR");
	});

	it("returns 404 on GET /:id for non-existent article", async () => {
		const response = await fetch(
			`${origin}/articles/00000000-0000-0000-0000-000000000000`,
		);

		assert.equal(response.status, 404);

		const body = (await response.json()) as { code: string };

		assert.equal(body.code, "NOT_FOUND");
	});

	it("returns a single article on GET /:id", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Artigo unico", content: "Unico" }),
		});

		assert.equal(createResponse.status, 201);

		const created = await createResponse.json();

		const response = await fetch(`${origin}/articles/${created.id}`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), created);
	});

	it("returns 403 on PATCH /:id when caller is not the author", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Artigo de outro",
				content: "Nao mexa",
			}),
		});

		assert.equal(createResponse.status, 201);

		const created = await createResponse.json();

		const patchResponse = await fetch(
			`${origin}/articles-other/${created.id}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Tentativa de edicao" }),
			},
		);

		assert.equal(patchResponse.status, 403);
		assert.deepEqual(await patchResponse.json(), {
			code: "FORBIDDEN",
			message: "Voce nao tem permissao para editar este artigo",
		});
	});

	it("updates an article on PATCH /:id when caller is the author", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Artigo original", content: "Original" }),
		});

		assert.equal(createResponse.status, 201);

		const created = await createResponse.json();

		const patchResponse = await fetch(`${origin}/articles/${created.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Artigo atualizado" }),
		});

		assert.equal(patchResponse.status, 200);

		const updated = (await patchResponse.json()) as Record<string, unknown>;

		assert.equal(updated.id, created.id);
		assert.equal(updated.authorId, fakeUserId);
		assert.equal(updated.title, "Artigo atualizado");
		assert.equal(updated.content, "Original");
		assert.equal(updated.coverFit, "cover");
		assert.ok(
			new Date(updated.updatedAt as string) > new Date(created.updatedAt),
		);
	});

	it("updates the cover fit without requiring a new image", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Diagrama", content: "Conteudo" }),
		});
		const created = (await createResponse.json()) as {
			id: string;
			coverFit: string;
		};
		assert.equal(created.coverFit, "cover");

		const patchResponse = await fetch(`${origin}/articles/${created.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ coverFit: "contain" }),
		});
		const updated = (await patchResponse.json()) as { coverFit: string };

		assert.equal(patchResponse.status, 200);
		assert.equal(updated.coverFit, "contain");
	});

	it("confirms and removes a cover when the caller is the author", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Artigo com capa", content: "Conteudo" }),
		});
		const created = (await createResponse.json()) as { id: string };
		const putResponse = await fetch(`${origin}/articles/${created.id}/cover`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				objectKey: `pending/${fakeUserId}/article-cover/11111111-1111-4111-8111-111111111111.png`,
			}),
		});
		const covered = (await putResponse.json()) as { coverUrl: string | null };
		const deleteResponse = await fetch(
			`${origin}/articles/${created.id}/cover`,
			{ method: "DELETE" },
		);
		const withoutCover = (await deleteResponse.json()) as {
			coverUrl: string | null;
		};

		assert.equal(putResponse.status, 200);
		assert.match(
			covered.coverUrl ?? "",
			new RegExp(
				`^https://media\\.example\\.com/article-covers/${created.id}/`,
			),
		);
		assert.equal(deleteResponse.status, 200);
		assert.equal(withoutCover.coverUrl, null);
	});

	it("returns 403 when another user tries to confirm a cover", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "Capa protegida", content: "Conteudo" }),
		});
		const created = (await createResponse.json()) as { id: string };
		const response = await fetch(
			`${origin}/articles-other/${created.id}/cover`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					objectKey: `pending/${otherUserId}/article-cover/11111111-1111-4111-8111-111111111111.png`,
				}),
			},
		);

		assert.equal(response.status, 403);
	});

	it("returns 404 on PATCH when update finds no article", async () => {
		const raceArticleId = "11111111-1111-4111-8111-111111111111";
		const article: Article = {
			id: raceArticleId,
			authorId: fakeUserId,
			title: "Artigo sumiu",
			content: "Conteudo",
			coverObjectKey: null,
			coverUrl: null,
			coverFit: "cover",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const repository: ArticleRepository = {
			async create() {
				return article;
			},
			async findById(id) {
				return id === raceArticleId ? article : null;
			},
			async findAll() {
				return [article];
			},
			async update() {
				return null;
			},
			async replaceCoverObjectKey() {
				return null;
			},
			async delete() {},
		};
		const raceService = new ArticleService(repository);
		const app = express();

		app.use(express.json());
		app.use(
			"/articles-race",
			createArticlesController(
				raceService,
				createRequireAuth(async () => ({
					user: { id: fakeUserId },
					expires: new Date(Date.now() + 3600_000).toISOString(),
				})),
			),
		);
		app.use(errorHandler);

		const raceServer = await new Promise<Server>((resolve, reject) => {
			const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
			listener.once("error", reject);
		});

		try {
			const address = raceServer.address();

			assert.ok(address && typeof address === "object");

			const raceOrigin = `http://127.0.0.1:${address.port}`;
			const response = await fetch(
				`${raceOrigin}/articles-race/${raceArticleId}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title: "Novo titulo" }),
				},
			);

			assert.equal(response.status, 404);

			const body = (await response.json()) as { code: string; message: string };

			assert.equal(body.code, "NOT_FOUND");
			assert.equal(body.message, "Artigo nao encontrado");
		} finally {
			await new Promise<void>((resolve, reject) => {
				raceServer.close((error) => (error ? reject(error) : resolve()));
			});
		}
	});

	it("returns 403 on DELETE /:id when caller is not the author", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Artigo para deletar",
				content: "Nao mexa",
			}),
		});

		assert.equal(createResponse.status, 201);

		const created = await createResponse.json();

		const deleteResponse = await fetch(
			`${origin}/articles-other/${created.id}`,
			{
				method: "DELETE",
			},
		);

		assert.equal(deleteResponse.status, 403);
		assert.deepEqual(await deleteResponse.json(), {
			code: "FORBIDDEN",
			message: "Voce nao tem permissao para deletar este artigo",
		});
	});

	it("deletes an article on DELETE /:id when caller is the author", async () => {
		const createResponse = await fetch(`${origin}/articles`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: "Artigo para deletar",
				content: "Deletar",
			}),
		});

		assert.equal(createResponse.status, 201);

		const created = await createResponse.json();

		const deleteResponse = await fetch(`${origin}/articles/${created.id}`, {
			method: "DELETE",
		});

		assert.equal(deleteResponse.status, 204);
		assert.equal(deleteResponse.headers.get("content-length"), null);

		const getResponse = await fetch(`${origin}/articles/${created.id}`);

		assert.equal(getResponse.status, 404);
	});
});
