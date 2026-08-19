import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "../../../shared/errors";

import type { Article } from "../../articles/entities/article.entity";
import type { ArticleRepository } from "../../articles/repositories/article-repository";
import type { Tag } from "../entities/tag.entity";
import type { TagRepository } from "../repositories/tag-repository";
import { TagService } from "./tags.service";

const articleId = "11111111-1111-4111-8111-111111111111";
const authorId = "22222222-2222-4222-8222-222222222222";
const otherAuthorId = "33333333-3333-4333-8333-333333333333";
const firstTagId = "44444444-4444-4444-8444-444444444444";
const secondTagId = "55555555-5555-4555-8555-555555555555";
const missingTagId = "66666666-6666-4666-8666-666666666666";

function createArticle(overrides: Partial<Article> = {}): Article {
	return {
		id: articleId,
		authorId,
		title: "Artigo",
		content: "Conteudo",
		status: "published",
		coverObjectKey: null,
		coverUrl: null,
		coverFit: "cover",
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		...overrides,
	};
}

function createTag(overrides: Partial<Tag> = {}): Tag {
	return {
		id: firstTagId,
		name: "TypeScript",
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		...overrides,
	};
}

function createArticleRepository(article: Article | null): ArticleRepository {
	return {
		async create(input) {
			return createArticle(input);
		},
		async findById(id) {
			return article?.id === id ? article : null;
		},
		async findAll() {
			return article ? [article] : [];
		},
		async update(id, input) {
			return article?.id === id ? { ...article, ...input } : null;
		},
		async replaceCoverObjectKey(id, objectKey) {
			if (!article || article.id !== id) return null;

			return {
				article: { ...article, coverObjectKey: objectKey },
				previousObjectKey: article.coverObjectKey,
			};
		},
		async delete() {},
	};
}

function createTagRepository(
	initialTags: Tag[] = [],
	initialArticleTags: Record<string, string[]> = {},
) {
	const tags = new Map(initialTags.map((tag) => [tag.id, tag]));
	const articleTags = new Map(
		Object.entries(initialArticleTags).map(([id, tagIds]) => [id, [...tagIds]]),
	);
	const calls = {
		createInputs: [] as string[],
		findManyByIds: [] as string[][],
		findByArticleId: [] as string[],
		replaceArticleTags: [] as Array<{
			articleId: string;
			tagIds: string[];
		}>,
	};

	const repository: TagRepository = {
		async create(input) {
			calls.createInputs.push(input.name);
			const tag = createTag({
				id: `created-tag-${tags.size + 1}`,
				name: input.name,
			});
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
			calls.findManyByIds.push([...ids]);
			return [...tags.values()].filter((tag) => ids.includes(tag.id));
		},
		async findByArticleId(requestedArticleId) {
			calls.findByArticleId.push(requestedArticleId);
			return (articleTags.get(requestedArticleId) ?? [])
				.map((tagId) => tags.get(tagId))
				.filter((tag): tag is Tag => tag !== undefined);
		},
		async replaceArticleTags(requestedArticleId, tagIds) {
			calls.replaceArticleTags.push({
				articleId: requestedArticleId,
				tagIds: [...tagIds],
			});
			articleTags.set(requestedArticleId, [...tagIds]);
		},
	};

	return { repository, calls };
}

describe("TagService", () => {
	it("normalizes and creates a tag", async () => {
		const { repository, calls } = createTagRepository();
		const service = new TagService(repository, createArticleRepository(null));

		const tag = await service.createTag("  TypeScript  ");

		assert.equal(tag.name, "TypeScript");
		assert.deepEqual(calls.createInputs, ["TypeScript"]);
	});

	it("does not create a tag with an existing normalized name", async () => {
		const { repository, calls } = createTagRepository([createTag()]);
		const service = new TagService(repository, createArticleRepository(null));

		await assert.rejects(service.createTag(" TypeScript "), ConflictError);
		assert.deepEqual(calls.createInputs, []);
	});

	it("lists the tag catalog", async () => {
		const expected = [
			createTag(),
			createTag({ id: secondTagId, name: "Banco de dados" }),
		];
		const { repository } = createTagRepository(expected);
		const service = new TagService(repository, createArticleRepository(null));

		assert.deepEqual(await service.listTags(), expected);
	});

	it("gets the tags assigned to an article", async () => {
		const expected = createTag();
		const { repository } = createTagRepository([expected], {
			[articleId]: [expected.id],
		});
		const service = new TagService(repository, createArticleRepository(null));

		assert.deepEqual(await service.getArticleTags(articleId), [expected]);
	});

	it("replaces and returns the tags of an owned article", async () => {
		const firstTag = createTag();
		const secondTag = createTag({
			id: secondTagId,
			name: "Banco de dados",
		});
		const { repository, calls } = createTagRepository([firstTag, secondTag]);
		const service = new TagService(
			repository,
			createArticleRepository(createArticle()),
		);

		const result = await service.setArticleTags(articleId, authorId, [
			secondTagId,
			firstTagId,
		]);

		assert.deepEqual(calls.replaceArticleTags, [
			{ articleId, tagIds: [secondTagId, firstTagId] },
		]);
		assert.deepEqual(calls.findByArticleId, [articleId]);
		assert.deepEqual(result, [secondTag, firstTag]);
	});

	it("removes all tags when given an empty list", async () => {
		const tag = createTag();
		const { repository, calls } = createTagRepository([tag], {
			[articleId]: [tag.id],
		});
		const service = new TagService(
			repository,
			createArticleRepository(createArticle()),
		);

		const result = await service.setArticleTags(articleId, authorId, []);

		assert.deepEqual(calls.findManyByIds, [[]]);
		assert.deepEqual(calls.replaceArticleTags, [{ articleId, tagIds: [] }]);
		assert.deepEqual(result, []);
	});

	it("rejects tags for a missing article", async () => {
		const { repository, calls } = createTagRepository([createTag()]);
		const service = new TagService(repository, createArticleRepository(null));

		await assert.rejects(
			service.setArticleTags(articleId, authorId, [firstTagId]),
			NotFoundError,
		);
		assert.deepEqual(calls.findManyByIds, []);
		assert.deepEqual(calls.replaceArticleTags, []);
	});

	it("rejects tags from a user who is not the article author", async () => {
		const { repository, calls } = createTagRepository([createTag()]);
		const service = new TagService(
			repository,
			createArticleRepository(createArticle()),
		);

		await assert.rejects(
			service.setArticleTags(articleId, otherAuthorId, [firstTagId]),
			ForbiddenError,
		);
		assert.deepEqual(calls.findManyByIds, []);
		assert.deepEqual(calls.replaceArticleTags, []);
	});

	it("rejects one or more missing tags", async () => {
		const { repository, calls } = createTagRepository([createTag()]);
		const service = new TagService(
			repository,
			createArticleRepository(createArticle()),
		);

		await assert.rejects(
			service.setArticleTags(articleId, authorId, [firstTagId, missingTagId]),
			BadRequestError,
		);
		assert.deepEqual(calls.replaceArticleTags, []);
	});

	it("rejects duplicated tag ids", async () => {
		const { repository, calls } = createTagRepository([createTag()]);
		const service = new TagService(
			repository,
			createArticleRepository(createArticle()),
		);

		await assert.rejects(
			service.setArticleTags(articleId, authorId, [firstTagId, firstTagId]),
			BadRequestError,
		);
		assert.deepEqual(calls.replaceArticleTags, []);
	});
});
