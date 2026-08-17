import { z } from "zod";

export const likeResponseSchema = z.object({
	id: z.uuid(),
	articleId: z.uuid(),
	userId: z.uuid(),
	createdAt: z.coerce.date(),
});

export type LikeResponse = z.infer<typeof likeResponseSchema>;
