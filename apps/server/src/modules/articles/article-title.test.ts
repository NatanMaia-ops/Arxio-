import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	ARTICLE_TITLE_MAX_LENGTH,
	createArticleSchema,
} from "./http/dtos/create_article.dto";
import { updateArticleSchema } from "./http/dtos/update_article.dto";

const validContent = "Conteudo do artigo";

describe("Article title validation", () => {
	it("accepts 100 characters and rejects 101 when creating an article", () => {
		assert.equal(
			createArticleSchema.safeParse({
				title: "x".repeat(ARTICLE_TITLE_MAX_LENGTH),
				content: validContent,
			}).success,
			true,
		);
		assert.equal(
			createArticleSchema.safeParse({
				title: "x".repeat(ARTICLE_TITLE_MAX_LENGTH + 1),
				content: validContent,
			}).success,
			false,
		);
	});

	it("accepts 100 characters and rejects 101 when updating an article", () => {
		assert.equal(
			updateArticleSchema.safeParse({
				title: "x".repeat(ARTICLE_TITLE_MAX_LENGTH),
			}).success,
			true,
		);
		assert.equal(
			updateArticleSchema.safeParse({
				title: "x".repeat(ARTICLE_TITLE_MAX_LENGTH + 1),
			}).success,
			false,
		);
	});
});
