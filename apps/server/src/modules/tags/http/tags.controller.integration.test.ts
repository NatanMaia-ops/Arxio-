import assert from "node:assert/strict";
import crypto from "node:crypto";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";
import { errorHandler } from "../../../shared/http/error-handler";
import type { Article } from "../../articles/entities/article.entity";
import type { ArticleRepository } from "../../articles/repositories/article-repository";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import type { Tag } from "../entities/tag.entity";
import type { TagRepository } from "../repositories/tag-repository";
import { TagService } from "../services/tags.service";

import {
	createArticleTagsController,
	createTagsController,
} from "./tags.controller";

const authorId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const otherUserId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";
const articleId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";
const missingArticleId = "00000000-0000-0000-0000-000000000000";
const initialTagId = "d4e5f6a7-b8c9-4d5e-9f0a-1b2c3d4e5f6a";
const missingTagId = "e5f6a7b8-c9d0-4e5f-a1b2-c3d4e5f6a7b8";

const article: Article = {
	id: articleId,
	authorId,
	title: "Artigo existente",
	content: "Conteudo",
	status: "published",
	coverObjectKey: null,
	coverUrl: null,
	coverFit: "cover",
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const initialTag: Tag = {
	id: initialTagId,
	name: "Banco de dados",
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createFakeArticleRepository(): ArticleRepository {
	return {
		async create() {
			throw new Error("not implemented");
		},
		async findById(id) {
			return id === article.id ? article : null;
		},
		async findAll() {
			return [article];
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

function createFakeTagRepository(): TagRepository {
	const tags = new Map([[initialTag.id, initialTag]]);
	const articleTags = new Map([[articleId, [initialTag.id]]]);

	return {
		async create(input) {
			const tag: Tag = {
				id: crypto.randomUUID(),
				name: input.name,
				createdAt: new Date(),
			};

			tags.set(tag.id, tag);
			return tag;
		},
		async findById(id) {
			return tags.get(id) ?? null;
		},
		async findByName(name) {
			return [...tags.values()].find((tag) => tag.name === name) ?? null;
		},
		async findAll() {
			return [...tags.values()];
		},
		async findManyByIds(ids) {
			return [...tags.values()].filter((tag) => ids.includes(tag.id));
		},
		async findByArticleId(requestedArticleId) {
			return (articleTags.get(requestedArticleId) ?? [])
				.map((tagId) => tags.get(tagId))
				.filter((tag): tag is Tag => tag !== undefined);
		},
		async replaceArticleTags(requestedArticleId, tagIds) {
			articleTags.set(requestedArticleId, [...tagIds]);
		},
	};
}

function authenticatedSession(userId: string) {
	return async () => ({
		user: { id: userId },
		expires: new Date(Date.now() + 3600_000).toISOString(),
	});
}

describe("Tags HTTP API", () => {
	let origin = "";
	let server: Server;
	let createdTagId = "";
	const tagsService = new TagService(
		createFakeTagRepository(),
		createFakeArticleRepository(),
	);

	before(async () => {
		const app = express();

		app.use(express.json());

		app.use(
			"/tags",
			createTagsController(
				tagsService,
				createRequireAuth(authenticatedSession(authorId)),
			),
		);

		app.use(
			"/tags-noauth",
			createTagsController(
				tagsService,
				createRequireAuth(async () => null),
			),
		);

		app.use(
			"/articles/:articleId/tags",
			createArticleTagsController(
				tagsService,
				createRequireAuth(authenticatedSession(authorId)),
			),
		);

		app.use(
			"/articles-other/:articleId/tags",
			createArticleTagsController(
				tagsService,
				createRequireAuth(authenticatedSession(otherUserId)),
			),
		);

		app.use(
			"/articles-noauth/:articleId/tags",
			createArticleTagsController(
				tagsService,
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

	it("returns 401 when creating a tag without authentication", async () => {
		const response = await fetch(`${origin}/tags-noauth`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "TypeScript" }),
		});

		assert.equal(response.status, 401);
	});

	it("returns 400 when the tag name is outside the allowed length", async () => {
		for (const name of ["a", "a".repeat(51)]) {
			const response = await fetch(`${origin}/tags`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});

			assert.equal(response.status, 400);
			assert.equal(
				((await response.json()) as { code: string }).code,
				"VALIDATION_ERROR",
			);
		}
	});

	it("normalizes and creates a tag", async () => {
		const response = await fetch(`${origin}/tags`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "  TypeScript  " }),
		});

		assert.equal(response.status, 201);

		const body = (await response.json()) as {
			id: string;
			name: string;
			createdAt: string;
		};

		assert.equal(body.name, "TypeScript");
		assert.ok(body.id);
		assert.ok(Date.parse(body.createdAt));
		createdTagId = body.id;
	});

	it("returns 409 when the normalized tag name already exists", async () => {
		const response = await fetch(`${origin}/tags`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: " TypeScript " }),
		});

		assert.equal(response.status, 409);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"CONFLICT",
		);
	});

	it("lists the tag catalog without authentication", async () => {
		const response = await fetch(`${origin}/tags-noauth`);

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<{ name: string }>;

		assert.deepEqual(
			body.map((tag) => tag.name),
			["Banco de dados", "TypeScript"],
		);
	});

	it("lists an article's tags without authentication", async () => {
		const response = await fetch(`${origin}/articles-noauth/${articleId}/tags`);

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<{ id: string }>;

		assert.deepEqual(
			body.map((tag) => tag.id),
			[initialTagId],
		);
	});

	it("returns an empty list for a valid article id without associations", async () => {
		const response = await fetch(
			`${origin}/articles-noauth/${missingArticleId}/tags`,
		);

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), []);
	});

	it("returns 400 for an invalid article id", async () => {
		const response = await fetch(`${origin}/articles-noauth/invalid/tags`);

		assert.equal(response.status, 400);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"VALIDATION_ERROR",
		);
	});

	it("returns 401 when replacing tags without authentication", async () => {
		const response = await fetch(
			`${origin}/articles-noauth/${articleId}/tags`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tagIds: [initialTagId] }),
			},
		);

		assert.equal(response.status, 401);
	});

	it("replaces and returns an owned article's tags", async () => {
		assert.ok(createdTagId);

		const response = await fetch(`${origin}/articles/${articleId}/tags`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tagIds: [createdTagId, initialTagId] }),
		});

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<{ id: string }>;

		assert.deepEqual(
			body.map((tag) => tag.id),
			[createdTagId, initialTagId],
		);
	});

	it("returns the persisted tags after replacement", async () => {
		const response = await fetch(`${origin}/articles-noauth/${articleId}/tags`);

		assert.equal(response.status, 200);

		const body = (await response.json()) as Array<{ id: string }>;

		assert.deepEqual(
			body.map((tag) => tag.id),
			[createdTagId, initialTagId],
		);
	});

	it("returns 403 when another user replaces the article tags", async () => {
		const response = await fetch(`${origin}/articles-other/${articleId}/tags`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tagIds: [initialTagId] }),
		});

		assert.equal(response.status, 403);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"FORBIDDEN",
		);
	});

	it("returns 404 when replacing tags on a missing article", async () => {
		const response = await fetch(
			`${origin}/articles/${missingArticleId}/tags`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tagIds: [initialTagId] }),
			},
		);

		assert.equal(response.status, 404);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"NOT_FOUND",
		);
	});

	it("returns 400 for a missing or duplicated tag", async () => {
		for (const tagIds of [
			[initialTagId, missingTagId],
			[initialTagId, initialTagId],
		]) {
			const response = await fetch(`${origin}/articles/${articleId}/tags`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tagIds }),
			});

			assert.equal(response.status, 400);
			assert.equal(
				((await response.json()) as { code: string }).code,
				"BAD_REQUEST",
			);
		}
	});

	it("returns 400 for an invalid tag id", async () => {
		const response = await fetch(`${origin}/articles/${articleId}/tags`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tagIds: ["invalid"] }),
		});

		assert.equal(response.status, 400);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"VALIDATION_ERROR",
		);
	});

	it("returns 400 when assigning more than ten tags", async () => {
		const response = await fetch(`${origin}/articles/${articleId}/tags`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				tagIds: Array.from({ length: 11 }, () => crypto.randomUUID()),
			}),
		});

		assert.equal(response.status, 400);
		assert.equal(
			((await response.json()) as { code: string }).code,
			"VALIDATION_ERROR",
		);
	});

	it("removes all tags when given an empty list", async () => {
		const response = await fetch(`${origin}/articles/${articleId}/tags`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tagIds: [] }),
		});

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), []);

		const persistedResponse = await fetch(
			`${origin}/articles-noauth/${articleId}/tags`,
		);

		assert.deepEqual(await persistedResponse.json(), []);
	});
});
