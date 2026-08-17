import { db } from "@arxio/db";
import { likes } from "@arxio/db/schema/like";
import { and, count, eq } from "drizzle-orm";

import type { Like } from "../../entities/like.entity";
import type {
	CreateLikeInput,
	LikeRepository,
} from "../../repositories/like-repository";

function toLike(row: typeof likes.$inferSelect): Like {
	return {
		id: row.id,
		articleId: row.articleId,
		userId: row.userId,
		createdAt: row.createdAt,
	};
}

export const drizzleLikeRepository: LikeRepository = {
	async create(input: CreateLikeInput) {
		const [like] = await db
			.insert(likes)
			.values({
				articleId: input.articleId,
				userId: input.userId,
			})
			.returning();

		if (!like) {
			throw new Error("Failed to create like");
		}

		return toLike(like);
	},

	async findByArticleAndUser(articleId: string, userId: string) {
		const [like] = await db
			.select()
			.from(likes)
			.where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)));

		return like ? toLike(like) : null;
	},

	async countByArticle(articleId: string) {
		const [result] = await db
			.select({ count: count() })
			.from(likes)
			.where(eq(likes.articleId, articleId));

		return result?.count ?? 0;
	},

	async delete(articleId: string, userId: string) {
		await db
			.delete(likes)
			.where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)));
	},
};
