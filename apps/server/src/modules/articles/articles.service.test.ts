import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ForbiddenError, NotFoundError } from "../../shared/errors";
import { MediaService } from "../media/media.service";
import type { ObjectStorage } from "../media/object-storage";

import type { Article } from "./entities/article.entity";
import type { ArticleRepository } from "./repositories/article-repository";
import { ArticleService } from "./services/articles.service";

const articleId = "11111111-1111-4111-8111-111111111111";
const authorId = "22222222-2222-4222-8222-222222222222";
const pendingCoverKey = `pending/${authorId}/article-cover/33333333-3333-4333-8333-333333333333.png`;

function createArticleRepository(initialCover: string | null = null) {
	let article: Article = {
		id: articleId,
		authorId,
		title: "Artigo",
		content: "Conteudo",
		status: "draft",
		coverObjectKey: initialCover,
		coverUrl: null,
		coverFit: "cover",
		createdAt: new Date("2026-08-18T10:00:00.000Z"),
		updatedAt: new Date("2026-08-18T10:00:00.000Z"),
	};

	const repository: ArticleRepository = {
		async create(input) {
			article = { ...article, ...input };
			return article;
		},
		async findById(id) {
			return id === articleId ? article : null;
		},
		async findAll() {
			return [article];
		},
		async update(id, input) {
			if (id !== articleId) return null;
			article = { ...article, ...input, updatedAt: new Date() };
			return article;
		},
		async replaceCoverObjectKey(id, objectKey) {
			if (id !== articleId) return null;
			const previousObjectKey = article.coverObjectKey;
			article = { ...article, coverObjectKey: objectKey, coverUrl: null };
			return { article, previousObjectKey };
		},
		async delete() {},
	};

	return { repository, current: () => article };
}

function createMedia() {
	const copied: Array<{ source: string; destination: string }> = [];
	const deleted: string[] = [];
	const storage: ObjectStorage = {
		async createPresignedUpload() {
			throw new Error("not used");
		},
		async getMetadata() {
			return { contentType: "image/png", sizeBytes: 1024 };
		},
		async copy(source, destination) {
			copied.push({ source, destination });
		},
		async delete(key) {
			deleted.push(key);
		},
	};

	return {
		media: new MediaService(storage, "https://media.example.com"),
		copied,
		deleted,
	};
}

describe("ArticleService drafts", () => {
	it("creates an article as draft when status is omitted", async () => {
		const { repository, current } = createArticleRepository();
		const service = new ArticleService(repository);

		const article = await service.createArticle({
			authorId,
			title: "Novo artigo",
			content: "Em progresso",
			coverFit: "cover",
		});

		assert.equal(article.status, "draft");
		assert.equal(current().status, "draft");
	});

	it("creates an article as published when status is explicit", async () => {
		const { repository } = createArticleRepository();
		const service = new ArticleService(repository);

		const article = await service.createArticle({
			authorId,
			title: "Novo artigo",
			content: "Pronto para leitura",
			coverFit: "cover",
			status: "published",
		});

		assert.equal(article.status, "published");
	});

	it("publishes an article owned by the author", async () => {
		const { repository, current } = createArticleRepository();
		const service = new ArticleService(repository);

		const article = await service.publishArticle(articleId, authorId);

		assert.equal(article.status, "published");
		assert.equal(current().status, "published");
	});

	it("rejects publishing an article owned by another author", async () => {
		const { repository } = createArticleRepository();
		const service = new ArticleService(repository);

		await assert.rejects(
			service.publishArticle(articleId, "44444444-4444-4444-8444-444444444444"),
			ForbiddenError,
		);
	});

	it("rejects publishing an article that does not exist", async () => {
		const { repository } = createArticleRepository();
		const service = new ArticleService(repository);

		await assert.rejects(
			service.publishArticle("00000000-0000-0000-0000-000000000000", authorId),
			NotFoundError,
		);
	});
});

describe("ArticleService covers", () => {
	it("resolves a stored cover key to the public media URL", async () => {
		const coverKey = `article-covers/${articleId}/cover.webp`;
		const { repository } = createArticleRepository(coverKey);
		const { media } = createMedia();
		const service = new ArticleService(repository, media);

		const article = await service.getArticleById(articleId);

		assert.equal(article?.coverUrl, `https://media.example.com/${coverKey}`);
	});

	it("promotes and associates a new cover owned by the article author", async () => {
		const oldCover = `article-covers/${articleId}/old.png`;
		const { repository, current } = createArticleRepository(oldCover);
		const { media, copied, deleted } = createMedia();
		const service = new ArticleService(repository, media);

		const article = await service.setCover(
			articleId,
			authorId,
			pendingCoverKey,
		);

		assert.match(
			article.coverObjectKey ?? "",
			new RegExp(`^article-covers/${articleId}/.+\\.png$`),
		);
		assert.equal(current().coverObjectKey, article.coverObjectKey);
		assert.deepEqual(copied, [
			{ source: pendingCoverKey, destination: article.coverObjectKey },
		]);
		assert.deepEqual(deleted, [pendingCoverKey, oldCover]);
	});

	it("rejects a cover change from a user who is not the author", async () => {
		const { repository } = createArticleRepository();
		const { media, copied } = createMedia();
		const service = new ArticleService(repository, media);

		await assert.rejects(
			service.setCover(
				articleId,
				"44444444-4444-4444-8444-444444444444",
				pendingCoverKey,
			),
			ForbiddenError,
		);
		assert.deepEqual(copied, []);
	});

	it("removes the database association and deletes the previous cover", async () => {
		const oldCover = `article-covers/${articleId}/old.png`;
		const { repository, current } = createArticleRepository(oldCover);
		const { media, deleted } = createMedia();
		const service = new ArticleService(repository, media);

		const article = await service.removeCover(articleId, authorId);

		assert.equal(article.coverUrl, null);
		assert.equal(current().coverObjectKey, null);
		assert.deepEqual(deleted, [oldCover]);
	});
});
