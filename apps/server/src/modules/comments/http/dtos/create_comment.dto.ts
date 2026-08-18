import { z } from "zod";

import { commentContentSchema } from "./comment_content.dto";

export const createCommentSchema = z.object({
	content: commentContentSchema,
	parentId: z.uuid().optional(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
