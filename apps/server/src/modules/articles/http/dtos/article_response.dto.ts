import { z } from "zod";

import { coverFitSchema } from "./create_article.dto";

export const articleResponseSchema = z.object({
	id: z.string().uuid(),
	authorId: z.string().uuid(),
	title: z.string(),
	content: z.string(),
	coverUrl: z.url().nullable(),
	coverFit: coverFitSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type ArticleResponse = z.infer<typeof articleResponseSchema>;
