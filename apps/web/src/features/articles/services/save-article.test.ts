import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Article } from "../types/article.types";
import { ArticleCoverSaveError, saveArticleWithCover } from "./save-article";

const article: Article = {
	id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
	authorId: "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
	title: "Título",
	content: "conteúdo",
	coverUrl: null,
	coverFit: "cover",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("saveArticleWithCover", () => {
	it("reuses the created article when retrying a failed cover", async () => {
		let createCalls = 0;
		let updateCalls = 0;
		let persistedId: string | null = null;
		let uploadCalls = 0;
		const dependencies = {
			create: async () => {
				createCalls += 1;
				return article;
			},
			update: async () => {
				updateCalls += 1;
				return article;
			},
			upload: async () => {
				uploadCalls += 1;
				if (uploadCalls === 1) throw new Error("S3 indisponível");
				return "pending/cover.webp";
			},
			confirmCover: async () => ({
				...article,
				coverUrl: "https://media.example.com/cover.webp",
			}),
			removeCover: async () => article,
		};
		const input = {
			title: article.title,
			content: article.content,
			coverFit: article.coverFit,
		};
		const file = new File(["cover"], "cover.webp", { type: "image/webp" });

		await assert.rejects(
			saveArticleWithCover(
				{
					articleId: null,
					article: input,
					cover: { type: "upload", file },
					onArticlePersisted: (saved) => {
						persistedId = saved.id;
					},
				},
				dependencies,
			),
			ArticleCoverSaveError,
		);

		assert.equal(persistedId, article.id);
		await saveArticleWithCover(
			{
				articleId: persistedId,
				article: input,
				cover: { type: "upload", file },
			},
			dependencies,
		);

		assert.equal(createCalls, 1);
		assert.equal(updateCalls, 1);
	});
});
