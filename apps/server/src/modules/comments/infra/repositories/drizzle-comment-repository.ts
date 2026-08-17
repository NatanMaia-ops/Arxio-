import { db } from "@arxio/db";
import { comments } from "@arxio/db/schema/comment";
import { asc, eq } from "drizzle-orm";

import type { Comment } from "../../entities/comment.entity";
import type {
	CommentRepository,
	CreateCommentInput,
	UpdateCommentInput,
} from "../../repositories/comment-repository";

function toComment(row: typeof comments.$inferSelect): Comment {
	return {
		id: row.id,
		articleId: row.articleId,
		authorId: row.authorId,
		parentId: row.parentId,
		content: row.content,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const drizzleCommentRepository: CommentRepository = {
	async create(input: CreateCommentInput) {
		const [comment] = await db
			.insert(comments)
			.values({
				articleId: input.articleId,
				authorId: input.authorId,
				parentId: input.parentId ?? null,
				content: input.content,
			})
			.returning();

		if (!comment) {
			throw new Error("Failed to create comment");
		}

		return toComment(comment);
	},

	async findById(id: string) {
		const [comment] = await db
			.select()
			.from(comments)
			.where(eq(comments.id, id));

		return comment ? toComment(comment) : null;
	},

	async findByArticle(articleId: string) {
		const rows = await db
			.select()
			.from(comments)
			.where(eq(comments.articleId, articleId))
			.orderBy(asc(comments.createdAt));

		return rows.map(toComment);
	},

	async update(id: string, input: UpdateCommentInput) {
		const [comment] = await db
			.update(comments)
			.set({
				content: input.content,
				updatedAt: new Date(),
			})
			.where(eq(comments.id, id))
			.returning();

		return comment ? toComment(comment) : null;
	},

	async delete(id: string) {
		await db.delete(comments).where(eq(comments.id, id));
	},
};
