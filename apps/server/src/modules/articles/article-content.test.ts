import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	ARTICLE_CONTENT_MAX_LENGTH,
	countArticleContentCharacters,
} from "./article-content";
import { createArticleSchema } from "./http/dtos/create_article.dto";
import { updateArticleSchema } from "./http/dtos/update_article.dto";

function documentOf(text: string): string {
	return JSON.stringify({
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [{ type: "text", text, marks: [{ type: "bold" }] }],
			},
		],
	});
}

describe("Article content validation", () => {
	it("counts visible text without counting the editor JSON markup", () => {
		assert.equal(
			countArticleContentCharacters(documentOf("Texto visível")),
			13,
		);
		assert.equal(
			countArticleContentCharacters(
				JSON.stringify({
					type: "doc",
					content: [
						{ type: "paragraph", content: [{ type: "text", text: "a" }] },
						{ type: "paragraph", content: [{ type: "hardBreak" }] },
					],
				}),
			),
			2,
		);
	});

	it("accepts 30000 characters and rejects 30001 on create and update", () => {
		const contentAtLimit = documentOf("x".repeat(ARTICLE_CONTENT_MAX_LENGTH));
		const contentAboveLimit = documentOf(
			"x".repeat(ARTICLE_CONTENT_MAX_LENGTH + 1),
		);

		assert.equal(
			createArticleSchema.safeParse({
				title: "Título",
				content: contentAtLimit,
			}).success,
			true,
		);
		assert.equal(
			createArticleSchema.safeParse({
				title: "Título",
				content: contentAboveLimit,
			}).success,
			false,
		);
		assert.equal(
			updateArticleSchema.safeParse({ content: contentAboveLimit }).success,
			false,
		);
	});

	it("rejects a visually empty editor document", () => {
		assert.equal(
			createArticleSchema.safeParse({
				title: "Título",
				content: JSON.stringify({
					type: "doc",
					content: [{ type: "paragraph" }],
				}),
			}).success,
			false,
		);
	});
});
