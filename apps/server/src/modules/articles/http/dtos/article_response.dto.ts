import { z } from "zod";

export const articleResponseSchema = z.object({
	id: z.string().uuid(),
	authorId: z.string().uuid(),
	title: z.string(),
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type ArticleResponse = z.infer<typeof articleResponseSchema>;
