import { z } from "zod";

export const COMMENT_CONTENT_MAX_LENGTH = 300;

export const commentSchema = z.object({
	id: z.uuid(),
	articleId: z.uuid(),
	authorId: z.uuid(),
	parentId: z.uuid().nullable(),
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const commentListSchema = z.array(commentSchema);

export const commentInputSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, "O comentário não pode estar vazio")
		.max(
			COMMENT_CONTENT_MAX_LENGTH,
			`O comentário deve ter no máximo ${COMMENT_CONTENT_MAX_LENGTH} caracteres`,
		),
});
