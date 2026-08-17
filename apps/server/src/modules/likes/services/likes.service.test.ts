import assert from "node:assert/strict";
import crypto from "node:crypto";
import { describe, it } from "node:test";
import { ConflictError, NotFoundError } from "../../../shared/errors";
import type { Article } from "../../articles/entities/article.entity";
import type { ArticleRepository } from "../../articles/repositories/article-repository";
import type { Like } from "../entities/like.entity";
import type { LikeRepository } from "../repositories/like-repository";

import { LikeService } from "./likes.service";

const fakeArticleId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const fakeUserId = "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e";
const otherUserId = "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f";

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

const existingArticle: Article = {
	id: fakeArticleId,
	authorId: otherUserId,
	title: "Artigo existente",
	content: "Conteudo",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("LikeService", () => {
	it("likes an article", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		const like = await service.likeArticle(fakeArticleId, fakeUserId);

		assert.equal(like.articleId, fakeArticleId);
		assert.equal(like.userId, fakeUserId);
	});

	it("throws NotFoundError when the article does not exist", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([]),
		);

		await assert.rejects(
			() => service.likeArticle(fakeArticleId, fakeUserId),
			NotFoundError,
		);
	});

	it("throws ConflictError when the user already liked the article", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		await service.likeArticle(fakeArticleId, fakeUserId);

		await assert.rejects(
			() => service.likeArticle(fakeArticleId, fakeUserId),
			ConflictError,
		);
	});

	it("unlikes an article", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		await service.likeArticle(fakeArticleId, fakeUserId);
		await service.unlikeArticle(fakeArticleId, fakeUserId);

		const liked = await service.hasUserLiked(fakeArticleId, fakeUserId);

		assert.equal(liked, false);
	});

	it("throws NotFoundError when unliking something not liked", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		await assert.rejects(
			() => service.unlikeArticle(fakeArticleId, fakeUserId),
			NotFoundError,
		);
	});

	it("counts likes for an article", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		await service.likeArticle(fakeArticleId, fakeUserId);
		await service.likeArticle(fakeArticleId, otherUserId);

		const count = await service.getLikesCount(fakeArticleId);

		assert.equal(count, 2);
	});

	it("checks whether a user liked an article", async () => {
		const service = new LikeService(
			createFakeLikeRepository(),
			createFakeArticleRepository([existingArticle]),
		);

		assert.equal(await service.hasUserLiked(fakeArticleId, fakeUserId), false);

		await service.likeArticle(fakeArticleId, fakeUserId);

		assert.equal(await service.hasUserLiked(fakeArticleId, fakeUserId), true);
	});
});
