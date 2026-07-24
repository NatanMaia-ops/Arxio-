import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Article } from "./entities/article.entity";
import type { ArticleRepository } from "./repositories/article-repository";

import { ArticleService } from "./articles.service";

const article: Article = {
	id: "3f6a6f2e-3f8e-4b8a-9f1a-2f6f8b6a1c2d",
	authorId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
	title: "Titulo de exemplo",
	content: "Conteudo de exemplo",
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createRepository(
	overrides: Partial<ArticleRepository> = {},
): ArticleRepository {
	return {
		async create() {
			return article;
		},
		async findById() {
			return article;
		},
		async findAll() {
			return [article];
		},
		async update() {
			return article;
		},
		async delete() {},
		...overrides,
	};
}

describe("ArticleService", () => {
	it("creates an article with the given input", async () => {
		const receivedInputs: unknown[] = [];
		const repository = createRepository({
			async create(input) {
				receivedInputs.push(input);
				return article;
			},
		});
		const service = new ArticleService(repository);

		const created = await service.createArticle({
			authorId: article.authorId,
			title: article.title,
			content: article.content,
		});

		assert.equal(created, article);
		assert.deepEqual(receivedInputs[0], {
			authorId: article.authorId,
			title: article.title,
			content: article.content,
		});
	});

	it("returns an article found by id", async () => {
		let receivedId = "";
		const repository = createRepository({
			async findById(id) {
				receivedId = id;
				return article;
			},
		});
		const service = new ArticleService(repository);

		const found = await service.getArticleById(article.id);

		assert.equal(receivedId, article.id);
		assert.equal(found, article);
	});

	it("returns null when the article is not found by id", async () => {
		const repository = createRepository({
			async findById() {
				return null;
			},
		});
		const service = new ArticleService(repository);

		const found = await service.getArticleById("unknown-id");

		assert.equal(found, null);
	});

	it("lists all articles", async () => {
		const repository = createRepository({
			async findAll() {
				return [article];
			},
		});
		const service = new ArticleService(repository);

		const articles = await service.listArticles();

		assert.deepEqual(articles, [article]);
	});

	it("updates an article with the given id and input", async () => {
		let receivedId = "";
		let receivedInput: unknown = null;
		const updated: Article = { ...article, title: "Titulo atualizado" };
		const repository = createRepository({
			async update(id, input) {
				receivedId = id;
				receivedInput = input;
				return updated;
			},
		});
		const service = new ArticleService(repository);

		const result = await service.updateArticle(article.id, {
			title: "Titulo atualizado",
		});

		assert.equal(receivedId, article.id);
		assert.deepEqual(receivedInput, { title: "Titulo atualizado" });
		assert.equal(result, updated);
	});

	it("returns null when updating an article that does not exist", async () => {
		const repository = createRepository({
			async update() {
				return null;
			},
		});
		const service = new ArticleService(repository);

		const result = await service.updateArticle("unknown-id", {
			title: "Novo titulo",
		});

		assert.equal(result, null);
	});

	it("deletes an article by id", async () => {
		let receivedId = "";
		let deleteCalled = false;
		const repository = createRepository({
			async delete(id) {
				receivedId = id;
				deleteCalled = true;
			},
		});
		const service = new ArticleService(repository);

		await service.deleteArticle(article.id);

		assert.equal(receivedId, article.id);
		assert.equal(deleteCalled, true);
	});
});
