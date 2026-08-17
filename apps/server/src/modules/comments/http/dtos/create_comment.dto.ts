import { z } from "zod";

export const createCommentSchema = z.object({
	content: z.string().trim().min(1).max(2000),
	parentId: z.uuid().optional(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
