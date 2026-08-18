import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ARTICLE_CONTENT_MAX_LENGTH } from "../article-content";

import { articleInputSchema, TITLE_MAX_LENGTH } from "./article.schema";

function inputWithContent(content: string) {
	return {
		title: "Título válido",
		content: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: content }],
				},
			],
		}),
		coverFit: "cover",
	};
}

describe("articleInputSchema", () => {
	it("accepts a 100-character title and rejects 101 characters", () => {
		assert.equal(
			articleInputSchema.safeParse({
				...inputWithContent("Conteúdo"),
				title: "x".repeat(TITLE_MAX_LENGTH),
			}).success,
			true,
		);
		assert.equal(
			articleInputSchema.safeParse({
				...inputWithContent("Conteúdo"),
				title: "x".repeat(TITLE_MAX_LENGTH + 1),
			}).success,
			false,
		);
	});

	it("accepts 30000 visible characters and rejects 30001", () => {
		assert.equal(
			articleInputSchema.safeParse(
				inputWithContent("x".repeat(ARTICLE_CONTENT_MAX_LENGTH)),
			).success,
			true,
		);
		assert.equal(
			articleInputSchema.safeParse(
				inputWithContent("x".repeat(ARTICLE_CONTENT_MAX_LENGTH + 1)),
			).success,
			false,
		);
	});

	it("rejects a visually empty editor document", () => {
		assert.equal(
			articleInputSchema.safeParse(inputWithContent("")).success,
			false,
		);
	});
});
