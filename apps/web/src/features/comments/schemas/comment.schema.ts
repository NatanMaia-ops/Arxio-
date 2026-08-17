import { z } from "zod";

export const CONTENT_MAX_LENGTH = 2000;

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
		.max(CONTENT_MAX_LENGTH, "O comentário deve ter no máximo 2000 caracteres"),
});
