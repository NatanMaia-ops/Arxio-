import { z } from "zod";

import { commentContentSchema } from "./comment_content.dto";

export const updateCommentSchema = z.object({
	content: commentContentSchema,
});

export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
