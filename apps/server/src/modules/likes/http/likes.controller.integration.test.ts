import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";
import { errorHandler } from "../../../shared/http/error-handler";
import type { Article } from "../../articles/entities/article.entity";
import type { ArticleRepository } from "../../articles/repositories/article-repository";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import type { Like } from "../entities/like.entity";
import type { LikeRepository } from "../repositories/like-repository";
import { LikeService } from "../services/likes.service";

import { createLikesController } from "./likes.controller";

const fakeUserId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const otherUserId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";
const existingArticleId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";
const missingArticleId = "00000000-0000-0000-0000-000000000000";

function createFakeArticleRepository(): ArticleRepository {
	const article: Article = {
		id: existingArticleId,
		authorId: otherUserId,
		title: "Artigo existente",
		content: "Conteudo",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return {
		async create() {
			throw new Error("not implemented");
		},
		async findById(id) {
			return id === existingArticleId ? article : null;
		},
		async findAll() {
			return [article];
		},
		async update() {
			throw new Error("not implemented");
		},
		async delete() {
			throw new Error("not implemented");
		},
	};
}

function createFakeLikeRepository(): LikeRepository {
	const store: Like[] = [];

	return {
		async create(input) {
			const like: Like = {
				id: crypto.randomUUID(),
				articleId: input.articleId,
				userId: input.userId,
				createdAt: new Date(),
			};

			store.push(like);

			return like;
		},
		async findByArticleAndUser(articleId, userId) {
			return (
				store.find(
					(like) => like.articleId === articleId && like.userId === userId,
				) ?? null
			);
		},
		async countByArticle(articleId) {
			return store.filter((like) => like.articleId === articleId).length;
		},
		async delete(articleId, userId) {
			const index = store.findIndex(
				(like) => like.articleId === articleId && like.userId === userId,
			);

			if (index !== -1) {
				store.splice(index, 1);
			}
		},
	};
}

function authenticatedSession(userId: string) {
	return async () => ({
		user: { id: userId },
		expires: new Date(Date.now() + 3600_000).toISOString(),
	});
}

describe("Likes HTTP API", () => {
	let origin = "";
	let server: Server;
	const likesService = new LikeService(
		createFakeLikeRepository(),
		createFakeArticleRepository(),
	);

	before(async () => {
		const app = express();

		app.use(express.json());

		app.use(
			"/likes/:articleId",
			createLikesController(
				likesService,
				createRequireAuth(authenticatedSession(fakeUserId)),
				authenticatedSession(fakeUserId),
			),
		);

		app.use(
			"/likes-other/:articleId",
			createLikesController(
				likesService,
				createRequireAuth(authenticatedSession(otherUserId)),
				authenticatedSession(otherUserId),
			),
		);

		app.use(
			"/likes-noauth/:articleId",
			createLikesController(
				likesService,
				createRequireAuth(async () => null),
				async () => null,
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
		const response = await fetch(
			`${origin}/likes-noauth/${existingArticleId}`,
			{ method: "POST" },
		);

		assert.equal(response.status, 401);
	});

	it("returns 404 on POST when the article does not exist", async () => {
		const response = await fetch(`${origin}/likes/${missingArticleId}`, {
			method: "POST",
		});

		assert.equal(response.status, 404);

		const body = (await response.json()) as { code: string };

		assert.equal(body.code, "NOT_FOUND");
	});

	it("likes an article with authenticated POST", async () => {
		const response = await fetch(`${origin}/likes/${existingArticleId}`, {
			method: "POST",
		});

		assert.equal(response.status, 201);

		const body = (await response.json()) as Record<string, unknown>;

		assert.ok(body.id);
		assert.equal(body.articleId, existingArticleId);
		assert.equal(body.userId, fakeUserId);
	});

	it("returns 409 on POST when the user already liked the article", async () => {
		const response = await fetch(`${origin}/likes/${existingArticleId}`, {
			method: "POST",
		});

		assert.equal(response.status, 409);

		const body = (await response.json()) as { code: string };

		assert.equal(body.code, "CONFLICT");
	});

	it("returns the likes count and likedByMe on GET without a session", async () => {
		const response = await fetch(`${origin}/likes-noauth/${existingArticleId}`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), { count: 1, likedByMe: false });
	});

	it("returns likedByMe true for the user who liked the article", async () => {
		const response = await fetch(`${origin}/likes/${existingArticleId}`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), { count: 1, likedByMe: true });
	});

	it("returns likedByMe false for a different authenticated user", async () => {
		const response = await fetch(`${origin}/likes-other/${existingArticleId}`);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), { count: 1, likedByMe: false });
	});

	it("returns 404 on DELETE when there is no like to remove", async () => {
		const response = await fetch(`${origin}/likes-other/${existingArticleId}`, {
			method: "DELETE",
		});

		assert.equal(response.status, 404);

		const body = (await response.json()) as { code: string };

		assert.equal(body.code, "NOT_FOUND");
	});

	it("unlikes an article with authenticated DELETE", async () => {
		const response = await fetch(`${origin}/likes/${existingArticleId}`, {
			method: "DELETE",
		});

		assert.equal(response.status, 204);
		assert.equal(response.headers.get("content-length"), null);

		const statusResponse = await fetch(
			`${origin}/likes-noauth/${existingArticleId}`,
		);

		assert.deepEqual(await statusResponse.json(), {
			count: 0,
			likedByMe: false,
		});
	});
});
