import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Article } from "../types/article.types";
import { ArticleCoverSaveError, saveArticleWithCover } from "./save-article";

const article: Article = {
	id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
	authorId: "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
	title: "Título",
	content: "conteúdo",
	status: "draft",
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
			publish: async () => ({ ...article, status: "published" as const }),
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
					intent: "draft",
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
				intent: "draft",
				cover: { type: "upload", file },
			},
			dependencies,
		);

		assert.equal(createCalls, 1);
		assert.equal(updateCalls, 1);
	});

	it("creates a new article as published when publishing directly", async () => {
		let createdStatus: string | undefined;
		let publishCalls = 0;
		const dependencies = {
			create: async (input: { status?: "draft" | "published" }) => {
				createdStatus = input.status;
				return { ...article, status: input.status ?? "draft" };
			},
			update: async () => article,
			upload: async () => "pending/cover.webp",
			confirmCover: async () => article,
			removeCover: async () => article,
			publish: async () => {
				publishCalls += 1;
				return { ...article, status: "published" as const };
			},
		};

		const saved = await saveArticleWithCover(
			{
				articleId: null,
				article: {
					title: article.title,
					content: article.content,
					coverFit: article.coverFit,
				},
				intent: "publish",
				cover: { type: "unchanged" },
			},
			dependencies,
		);

		assert.equal(createdStatus, "published");
		assert.equal(saved.status, "published");
		assert.equal(publishCalls, 0);
	});

	it("publishes an existing draft through the dedicated endpoint", async () => {
		let publishCalls = 0;
		const dependencies = {
			create: async () => article,
			update: async () => article,
			upload: async () => "pending/cover.webp",
			confirmCover: async () => article,
			removeCover: async () => article,
			publish: async () => {
				publishCalls += 1;
				return { ...article, status: "published" as const };
			},
		};

		const saved = await saveArticleWithCover(
			{
				articleId: article.id,
				article: {
					title: article.title,
					content: article.content,
					coverFit: article.coverFit,
				},
				intent: "publish",
				cover: { type: "unchanged" },
			},
			dependencies,
		);

		assert.equal(saved.status, "published");
		assert.equal(publishCalls, 1);
	});
});
