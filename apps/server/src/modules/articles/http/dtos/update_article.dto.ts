import { z } from "zod";

import { createArticleSchema } from "./create_article.dto";

export const updateArticleSchema = createArticleSchema.partial();

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
