import { db } from "@arxio/db";
import { articles } from "@arxio/db/schema/article";
import { eq } from "drizzle-orm";

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
		const rows = filters.authorId
			? await query.where(eq(articles.authorId, filters.authorId))
			: await query;

		return rows.map(toArticle);
	},

	async update(id: string, input: UpdateArticleInput) {
		const [article] = await db
			.update(articles)
			.set({
				title: input.title,
				content: input.content,
				updatedAt: new Date(),
			})
			.where(eq(articles.id, id))
			.returning();

		return article ? toArticle(article) : null;
	},

	async delete(id: string) {
		await db.delete(articles).where(eq(articles.id, id));
	},
};
