import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";
import { errorHandler } from "../../../shared/http/error-handler";
import type { Article } from "../../articles/entities/article.entity";
import type { ArticleRepository } from "../../articles/repositories/article-repository";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import type { Comment } from "../entities/comment.entity";
import type { CommentRepository } from "../repositories/comment-repository";
import { CommentService } from "../services/comments.service";

import {
	createArticleCommentsController,
	createCommentsController,
} from "./comments.controller";

const fakeUserId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const otherUserId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";
const existingArticleId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";
const otherArticleId = "d4e5f6a7-b8c9-4d5e-9f0a-1b2c3d4e5f6a";
const missingArticleId = "00000000-0000-0000-0000-000000000000";

function createFakeArticleRepository(articles: Article[]): ArticleRepository {
	return {
		async create() {
			throw new Error("not implemented");
		},
		async findById(id) {
			return articles.find((article) => article.id === id) ?? null;
		},
		async findAll() {
			return articles;
		},
		async update() {
			throw new Error("not implemented");
		},
		async replaceCoverObjectKey() {
			throw new Error("not implemented");
		},
		async delete() {
			throw new Error("not implemented");
		},
	};
}

function createFakeCommentRepository(): CommentRepository {
	const store = new Map<string, Comment>();

	return {
		async create(input) {
			const comment: Comment = {
				id: crypto.randomUUID(),
				articleId: input.articleId,
				authorId: input.authorId,
				parentId: input.parentId ?? null,
				content: input.content,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			store.set(comment.id, comment);

			return comment;
		},
		async findById(id) {
			return store.get(id) ?? null;
		},
		async findByArticle(articleId) {
			return Array.from(store.values()).filter(
				(comment) => comment.articleId === articleId,
			);
		},
		async update(id, input) {
			const comment = store.get(id);

			if (!comment) return null;

			const updated = {
				...comment,
				content: input.content,
				updatedAt: new Date(),
			};

			store.set(id, updated);

			return updated;
		},
		async delete(id) {
			store.delete(id);
		},
	};
}

function authenticatedSession(userId: string) {
	return async () => ({
		user: { id: userId },
		expires: new Date(Date.now() + 3600_000).toISOString(),
	});
}

const existingArticle: Article = {
	id: existingArticleId,
	authorId: otherUserId,
	title: "Artigo existente",
	content: "Conteudo",
	coverObjectKey: null,
	coverUrl: null,
	coverFit: "cover",
	createdAt: new Date(),
	updatedAt: new Date(),
};

const otherArticle: Article = {
	id: otherArticleId,
	authorId: otherUserId,
	title: "Outro artigo",
	content: "Outro conteudo",
	coverObjectKey: null,
	coverUrl: null,
	coverFit: "cover",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("Comments HTTP API", () => {
	let origin = "";
	let server: Server;
	const commentsService = new CommentService(
		createFakeCommentRepository(),
		createFakeArticleRepository([existingArticle, otherArticle]),
	);

	before(async () => {
		const app = express();

		app.use(express.json());

		app.use(
			"/articles/:articleId/comments",
			createArticleCommentsController(
				commentsService,
				createRequireAuth(authenticatedSession(fakeUserId)),
			),
		);

		app.use(
			"/articles-other/:articleId/comments",
			createArticleCommentsController(
				commentsService,
				createRequireAuth(authenticatedSession(otherUserId)),
			),
		);

		app.use(
			"/comments",
			createCommentsController(
				commentsService,
				createRequireAuth(authenticatedSession(fakeUserId)),
			),
		);

		app.use(
			"/comments-other",
			createCommentsController(
				commentsService,
				createRequireAuth(authenticatedSession(otherUserId)),
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

	it("creates a root comment with authenticated POST", async () => {
		const response = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Primeiro comentario" }),
			},
		);

		assert.equal(response.status, 201);

		const body = (await response.json()) as Record<string, unknown>;

		assert.equal(body.articleId, existingArticleId);
		assert.equal(body.authorId, fakeUserId);
		assert.equal(body.parentId, null);
	});

	it("returns 404 when the article does not exist", async () => {
		const response = await fetch(
			`${origin}/articles/${missingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Comentario" }),
			},
		);

		assert.equal(response.status, 404);
	});

	it("creates a reply and returns 404 for a reply to another article", async () => {
		const rootResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Raiz" }),
			},
		);
		const root = await rootResponse.json();

		const replyResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Resposta", parentId: root.id }),
			},
		);

		assert.equal(replyResponse.status, 201);

		const invalidReplyResponse = await fetch(
			`${origin}/articles/${otherArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: "Resposta invalida",
					parentId: root.id,
				}),
			},
		);

		assert.equal(invalidReplyResponse.status, 404);
	});

	it("lists comments for an article on GET / without authentication", async () => {
		const response = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
		);

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<{ articleId: string }>;

		assert.ok(Array.isArray(body));
		assert.ok(body.every((comment) => comment.articleId === existingArticleId));
	});

	it("returns 403 on PATCH when caller is not the author", async () => {
		const createResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Original" }),
			},
		);
		const created = await createResponse.json();

		const patchResponse = await fetch(
			`${origin}/comments-other/${created.id}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Tentativa" }),
			},
		);

		assert.equal(patchResponse.status, 403);
	});

	it("updates a comment on PATCH when caller is the author", async () => {
		const createResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Original" }),
			},
		);
		const created = await createResponse.json();

		const patchResponse = await fetch(`${origin}/comments/${created.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: "Atualizado" }),
		});

		assert.equal(patchResponse.status, 200);

		const updated = (await patchResponse.json()) as { content: string };

		assert.equal(updated.content, "Atualizado");
	});

	it("returns 403 on DELETE when caller is not the author", async () => {
		const createResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Para deletar" }),
			},
		);
		const created = await createResponse.json();

		const deleteResponse = await fetch(
			`${origin}/comments-other/${created.id}`,
			{ method: "DELETE" },
		);

		assert.equal(deleteResponse.status, 403);
	});

	it("deletes a comment on DELETE when caller is the author", async () => {
		const createResponse = await fetch(
			`${origin}/articles/${existingArticleId}/comments`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "Para deletar" }),
			},
		);
		const created = await createResponse.json();

		const deleteResponse = await fetch(`${origin}/comments/${created.id}`, {
			method: "DELETE",
		});

		assert.equal(deleteResponse.status, 204);
		assert.equal(deleteResponse.headers.get("content-length"), null);
	});
});
