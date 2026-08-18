import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	ARTICLE_CONTENT_MAX_LENGTH,
	countArticleContentCharacters,
	estimateReadTimeMinutes,
	extractExcerpt,
	extractPlainText,
	isEmptyContent,
	parseEditorDocument,
} from "./article-content";

function documentOf(...paragraphs: string[]): string {
	return JSON.stringify({
		type: "doc",
		content: paragraphs.map((text) => ({
			type: "paragraph",
			content: [{ type: "text", text }],
		})),
	});
}

describe("Article content", () => {
	it("extracts plain text from an editor document", () => {
		const content = documentOf("Primeiro parágrafo.", "Segundo parágrafo.");

		assert.equal(
			extractPlainText(content),
			"Primeiro parágrafo. Segundo parágrafo.",
		);
	});

	it("keeps inline marks joined without extra spaces", () => {
		const content = JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Trabalho " },
						{ type: "text", text: "profundo", marks: [{ type: "bold" }] },
						{ type: "text", text: "." },
					],
				},
			],
		});

		assert.equal(extractPlainText(content), "Trabalho profundo.");
	});

	it("reads nested list content", () => {
		const content = JSON.stringify({
			type: "doc",
			content: [
				{
					type: "bulletList",
					content: [
						{
							type: "listItem",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Primeiro item" }],
								},
							],
						},
						{
							type: "listItem",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Segundo item" }],
								},
							],
						},
					],
				},
			],
		});

		assert.equal(extractPlainText(content), "Primeiro item Segundo item");
	});

	it("counts visible characters without counting editor markup", () => {
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
		assert.equal(
			countArticleContentCharacters("x".repeat(ARTICLE_CONTENT_MAX_LENGTH)),
			ARTICLE_CONTENT_MAX_LENGTH,
		);
	});

	it("falls back to raw text when the content is not an editor document", () => {
		assert.equal(
			extractPlainText("texto simples salvo antes"),
			"texto simples salvo antes",
		);
		assert.equal(extractPlainText("{ nao e json"), "{ nao e json");
	});

	it("rejects json that is not an editor document", () => {
		assert.equal(parseEditorDocument('{"type":"paragraph"}'), null);
		assert.equal(parseEditorDocument("[]"), null);
		assert.equal(parseEditorDocument("null"), null);
		assert.equal(parseEditorDocument("nao e json"), null);
	});

	it("detects empty content", () => {
		assert.equal(isEmptyContent(documentOf("")), true);
		assert.equal(isEmptyContent(JSON.stringify({ type: "doc" })), true);
		assert.equal(isEmptyContent("   "), true);
		assert.equal(isEmptyContent(documentOf("Tem texto")), false);
	});

	it("truncates the excerpt on a word boundary", () => {
		const excerpt = extractExcerpt(documentOf("um dois tres quatro cinco"), 12);

		assert.equal(excerpt, "um dois tres…");
	});

	it("keeps the excerpt intact when it fits", () => {
		assert.equal(extractExcerpt(documentOf("curto"), 12), "curto");
	});

	it("estimates read time from the word count", () => {
		const words = Array.from({ length: 400 }, () => "palavra").join(" ");

		assert.equal(estimateReadTimeMinutes(documentOf(words)), 2);
	});

	it("never reports less than one minute", () => {
		assert.equal(estimateReadTimeMinutes(documentOf("uma palavra")), 1);
		assert.equal(estimateReadTimeMinutes(documentOf("")), 1);
	});
});
