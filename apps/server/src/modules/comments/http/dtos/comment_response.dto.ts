import { z } from "zod";

export const commentResponseSchema = z.object({
	id: z.uuid(),
	articleId: z.uuid(),
	authorId: z.uuid(),
	parentId: z.uuid().nullable(),
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type CommentResponse = z.infer<typeof commentResponseSchema>;
