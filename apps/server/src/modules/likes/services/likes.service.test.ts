import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ConflictError, NotFoundError } from "../../../shared/errors";

import type { Article } from "../../articles/entities/article.entity";
import type {
	ArticleRepository,
	CreateArticleInput,
	ListArticlesFilters,
	UpdateArticleInput,
} from "../../articles/repositories/article-repository";
import type { Like } from "../entities/like.entity";
import type {
	CreateLikeInput,
	LikeRepository,
} from "../repositories/like-repository";
import { LikeService } from "./likes.service";

const articleId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";

function createArticle(id: string): Article {
	return {
		id,
		authorId: "44444444-4444-4444-8444-444444444444",
		title: "Test article",
		content: "Test content",
		status: "published",
		coverObjectKey: null,
		coverUrl: null,
		coverFit: "cover",
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
	};
}

function createArticleRepository(
	initialArticles: Article[] = [],
): ArticleRepository {
	const articles = new Map(
		initialArticles.map((article) => [article.id, article]),
	);

	return {
		async create(input: CreateArticleInput) {
			const article = createArticle(`article-${articles.size + 1}`);
			Object.assign(article, input);
			articles.set(article.id, article);
			return article;
		},
		async findById(id: string) {
			return articles.get(id) ?? null;
		},
		async findAll(filters: ListArticlesFilters = {}) {
			return [...articles.values()].filter(
				(article) => !filters.authorId || article.authorId === filters.authorId,
			);
		},
		async update(id: string, input: UpdateArticleInput) {
			const article = articles.get(id);
			if (!article) return null;
			const updated = { ...article, ...input };
			articles.set(id, updated);
			return updated;
		},
		async replaceCoverObjectKey(id, objectKey) {
			const article = articles.get(id);
			if (!article) return null;
			const previousObjectKey = article.coverObjectKey;
			const updated = { ...article, coverObjectKey: objectKey, coverUrl: null };
			articles.set(id, updated);
			return { article: updated, previousObjectKey };
		},
		async delete(id: string) {
			articles.delete(id);
		},
	};
}

function createLikeRepository(initialLikes: Like[] = []): LikeRepository {
	const likes = new Map(
		initialLikes.map((like) => [`${like.articleId}:${like.userId}`, like]),
	);

	return {
		async create(input: CreateLikeInput) {
			const like: Like = {
				id: `like-${likes.size + 1}`,
				...input,
				createdAt: new Date("2026-01-01T00:00:00.000Z"),
			};
			likes.set(`${input.articleId}:${input.userId}`, like);
			return like;
		},
		async findByArticleAndUser(requestedArticleId, requestedUserId) {
			return likes.get(`${requestedArticleId}:${requestedUserId}`) ?? null;
		},
		async countByArticle(requestedArticleId) {
			return [...likes.values()].filter(
				(like) => like.articleId === requestedArticleId,
			).length;
		},
		async delete(requestedArticleId, requestedUserId) {
			likes.delete(`${requestedArticleId}:${requestedUserId}`);
		},
	};
}

function createLike(overrides: Partial<Like> = {}): Like {
	return {
		id: "55555555-5555-4555-8555-555555555555",
		articleId,
		userId,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		...overrides,
	};
}

describe("LikeService", () => {
	it("likes an existing article", async () => {
		const likes = createLikeRepository();
		const service = new LikeService(
			likes,
			createArticleRepository([createArticle(articleId)]),
		);

		const like = await service.likeArticle(articleId, userId);

		assert.equal(like.articleId, articleId);
		assert.equal(like.userId, userId);
		assert.deepEqual(await likes.findByArticleAndUser(articleId, userId), like);
	});

	it("does not like a missing article", async () => {
		const service = new LikeService(
			createLikeRepository(),
			createArticleRepository(),
		);

		await assert.rejects(service.likeArticle(articleId, userId), NotFoundError);
	});

	it("does not like the same article twice", async () => {
		const service = new LikeService(
			createLikeRepository([createLike()]),
			createArticleRepository([createArticle(articleId)]),
		);

		await assert.rejects(service.likeArticle(articleId, userId), ConflictError);
	});

	it("unlikes an article", async () => {
		const likes = createLikeRepository([createLike()]);
		const service = new LikeService(likes, createArticleRepository());

		await service.unlikeArticle(articleId, userId);

		assert.equal(await likes.findByArticleAndUser(articleId, userId), null);
	});

	it("does not unlike an article without an existing like", async () => {
		const service = new LikeService(
			createLikeRepository(),
			createArticleRepository(),
		);

		await assert.rejects(
			service.unlikeArticle(articleId, userId),
			NotFoundError,
		);
	});

	it("counts article likes", async () => {
		const service = new LikeService(
			createLikeRepository([
				createLike(),
				createLike({
					id: "66666666-6666-4666-8666-666666666666",
					userId: otherUserId,
				}),
				createLike({
					id: "77777777-7777-4777-8777-777777777777",
					articleId: "88888888-8888-4888-8888-888888888888",
				}),
			]),
			createArticleRepository(),
		);

		assert.equal(await service.getLikesCount(articleId), 2);
	});

	it("checks whether a user liked an article", async () => {
		const service = new LikeService(
			createLikeRepository([createLike()]),
			createArticleRepository(),
		);

		assert.equal(await service.hasUserLiked(articleId, userId), true);
		assert.equal(await service.hasUserLiked(articleId, otherUserId), false);
	});
});
