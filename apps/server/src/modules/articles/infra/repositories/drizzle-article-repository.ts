import { db } from "@arxio/db";
import { articles } from "@arxio/db/schema/article";
import { and, eq } from "drizzle-orm";

import type { Article } from "../../entities/article.entity";
import type {
	ArticleRepository,
	CreateArticleInput,
	ListArticlesFilters,
	UpdateArticleInput,
} from "../../repositories/article-repository";

function toArticle(row: typeof articles.$inferSelect): Article {
	return {
		id: row.id,
		authorId: row.authorId,
		title: row.title,
		content: row.content,
		status: row.status as Article["status"],
		coverObjectKey: row.coverObjectKey,
		coverUrl: null,
		coverFit: row.coverFit,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const drizzleArticleRepository: ArticleRepository = {
	async create(input: CreateArticleInput) {
		const [article] = await db
			.insert(articles)
			.values({
				authorId: input.authorId,
				title: input.title,
				content: input.content,
				status: input.status,
				coverFit: input.coverFit,
			})
			.returning();

		if (!article) {
			throw new Error("Failed to create article");
		}

		return toArticle(article);
	},

	async findById(id: string) {
		const [article] = await db
			.select()
			.from(articles)
			.where(eq(articles.id, id));

		return article ? toArticle(article) : null;
	},

	async findAll(filters: ListArticlesFilters = {}) {
		const query = db.select().from(articles);
		const authorCondition = filters.authorId
			? eq(articles.authorId, filters.authorId)
			: undefined;
		const statusCondition = filters.status
			? eq(articles.status, filters.status)
			: undefined;
		const condition =
			authorCondition && statusCondition
				? and(authorCondition, statusCondition)
				: (authorCondition ?? statusCondition);
		const rows = condition ? await query.where(condition) : await query;

		return rows.map(toArticle);
	},

	async update(id: string, input: UpdateArticleInput) {
		const [article] = await db
			.update(articles)
			.set({
				title: input.title,
				content: input.content,
				status: input.status,
				coverFit: input.coverFit,
				updatedAt: new Date(),
			})
			.where(eq(articles.id, id))
			.returning();

		return article ? toArticle(article) : null;
	},

	async replaceCoverObjectKey(id, objectKey) {
		return db.transaction(async (transaction) => {
			const [existing] = await transaction
				.select({ previousObjectKey: articles.coverObjectKey })
				.from(articles)
				.where(eq(articles.id, id))
				.for("update");

			if (!existing) return null;

			const [article] = await transaction
				.update(articles)
				.set({ coverObjectKey: objectKey, updatedAt: new Date() })
				.where(eq(articles.id, id))
				.returning();

			if (!article) {
				throw new Error("Failed to update article cover");
			}

			return {
				article: toArticle(article),
				previousObjectKey: existing.previousObjectKey,
			};
		});
	},

	async delete(id: string) {
		await db.delete(articles).where(eq(articles.id, id));
	},
};
