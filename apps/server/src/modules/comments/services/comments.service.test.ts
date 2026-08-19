import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ForbiddenError, NotFoundError } from "../../../shared/errors";

import type { Article } from "../../articles/entities/article.entity";
import type {
	ArticleRepository,
	CreateArticleInput,
	ListArticlesFilters,
	UpdateArticleInput,
} from "../../articles/repositories/article-repository";
import type { Comment } from "../entities/comment.entity";
import type {
	CommentRepository,
	CreateCommentInput,
	UpdateCommentInput,
} from "../repositories/comment-repository";
import { CommentService } from "./comments.service";

const articleId = "11111111-1111-4111-8111-111111111111";
const otherArticleId = "22222222-2222-4222-8222-222222222222";
const authorId = "33333333-3333-4333-8333-333333333333";
const otherAuthorId = "44444444-4444-4444-8444-444444444444";
const commentId = "55555555-5555-4555-8555-555555555555";

function createArticle(id: string): Article {
	return {
		id,
		authorId,
		title: "Article",
		content: "Content",
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
			const article = {
				...createArticle(`article-${articles.size + 1}`),
				...input,
			};
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

function createComment(overrides: Partial<Comment> = {}): Comment {
	return {
		id: commentId,
		articleId,
		authorId,
		parentId: null,
		content: "Comment",
		createdAt: new Date("2026-01-02T00:00:00.000Z"),
		updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		...overrides,
	};
}

function createCommentRepository(
	initialComments: Comment[] = [],
): CommentRepository {
	const comments = new Map(
		initialComments.map((comment) => [comment.id, comment]),
	);

	return {
		async create(input: CreateCommentInput) {
			const comment = createComment({
				id: `comment-${comments.size + 1}`,
				...input,
				parentId: input.parentId ?? null,
			});
			comments.set(comment.id, comment);
			return comment;
		},
		async findById(id: string) {
			return comments.get(id) ?? null;
		},
		async findByArticle(requestedArticleId: string) {
			return [...comments.values()].filter(
				(comment) => comment.articleId === requestedArticleId,
			);
		},
		async update(id: string, input: UpdateCommentInput) {
			const comment = comments.get(id);
			if (!comment) return null;
			const updated = { ...comment, ...input, updatedAt: new Date() };
			comments.set(id, updated);
			return updated;
		},
		async delete(id: string) {
			comments.delete(id);
		},
	};
}

describe("CommentService", () => {
	it("creates a root comment", async () => {
		const service = new CommentService(
			createCommentRepository(),
			createArticleRepository([createArticle(articleId)]),
		);

		const comment = await service.createComment({
			articleId,
			authorId,
			content: "Root comment",
		});

		assert.equal(comment.articleId, articleId);
		assert.equal(comment.authorId, authorId);
		assert.equal(comment.parentId, null);
	});

	it("creates a reply to a comment from the same article", async () => {
		const parent = createComment();
		const service = new CommentService(
			createCommentRepository([parent]),
			createArticleRepository([createArticle(articleId)]),
		);

		const reply = await service.createComment({
			articleId,
			authorId: otherAuthorId,
			parentId: parent.id,
			content: "Reply",
		});

		assert.equal(reply.parentId, parent.id);
	});

	it("does not reply to a comment from another article", async () => {
		const parent = createComment({ articleId: otherArticleId });
		const service = new CommentService(
			createCommentRepository([parent]),
			createArticleRepository([createArticle(articleId)]),
		);

		await assert.rejects(
			service.createComment({
				articleId,
				authorId,
				parentId: parent.id,
				content: "Invalid reply",
			}),
			NotFoundError,
		);
	});

	it("does not reply to a missing comment", async () => {
		const service = new CommentService(
			createCommentRepository(),
			createArticleRepository([createArticle(articleId)]),
		);

		await assert.rejects(
			service.createComment({
				articleId,
				authorId,
				parentId: commentId,
				content: "Invalid reply",
			}),
			NotFoundError,
		);
	});

	it("does not comment on a missing article", async () => {
		const service = new CommentService(
			createCommentRepository(),
			createArticleRepository(),
		);

		await assert.rejects(
			service.createComment({ articleId, authorId, content: "Comment" }),
			NotFoundError,
		);
	});

	it("updates a comment owned by the author", async () => {
		const repository = createCommentRepository([createComment()]);
		const service = new CommentService(repository, createArticleRepository());

		const updated = await service.updateComment(commentId, authorId, {
			content: "Updated comment",
		});

		assert.equal(updated.content, "Updated comment");
	});

	it("does not update a comment owned by another author", async () => {
		const service = new CommentService(
			createCommentRepository([createComment()]),
			createArticleRepository(),
		);

		await assert.rejects(
			service.updateComment(commentId, otherAuthorId, { content: "Updated" }),
			ForbiddenError,
		);
	});

	it("reports a missing comment on update", async () => {
		const service = new CommentService(
			createCommentRepository(),
			createArticleRepository(),
		);

		await assert.rejects(
			service.updateComment(commentId, authorId, { content: "Updated" }),
			NotFoundError,
		);
	});

	it("deletes a comment owned by the author", async () => {
		const repository = createCommentRepository([createComment()]);
		const service = new CommentService(repository, createArticleRepository());

		await service.deleteComment(commentId, authorId);

		assert.equal(await repository.findById(commentId), null);
	});

	it("does not delete a comment owned by another author", async () => {
		const service = new CommentService(
			createCommentRepository([createComment()]),
			createArticleRepository(),
		);

		await assert.rejects(
			service.deleteComment(commentId, otherAuthorId),
			ForbiddenError,
		);
	});

	it("reports a missing comment on delete", async () => {
		const service = new CommentService(
			createCommentRepository(),
			createArticleRepository(),
		);

		await assert.rejects(
			service.deleteComment(commentId, authorId),
			NotFoundError,
		);
	});

	it("lists article comments ordered by creation date", async () => {
		const later = createComment({
			id: "66666666-6666-4666-8666-666666666666",
			createdAt: new Date("2026-01-03T00:00:00.000Z"),
		});
		const earlier = createComment({
			id: "77777777-7777-4777-8777-777777777777",
			parentId: later.id,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
		});
		const service = new CommentService(
			createCommentRepository([later, earlier]),
			createArticleRepository(),
		);

		const comments = await service.listCommentsByArticle(articleId);

		assert.deepEqual(
			comments.map((comment) => comment.id),
			[earlier.id, later.id],
		);
		assert.equal(comments[0]?.parentId, later.id);
	});
});
