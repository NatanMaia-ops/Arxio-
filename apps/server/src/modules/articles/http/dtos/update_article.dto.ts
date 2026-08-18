import type { z } from "zod";

import { coverFitSchema, createArticleSchema } from "./create_article.dto";

export const updateArticleSchema = createArticleSchema
	.omit({ coverFit: true })
	.partial()
	.extend({ coverFit: coverFitSchema.optional() });

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
