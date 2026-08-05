import { z } from "zod";

export const listArticlesQuerySchema = z.strictObject({
	authorId: z.uuid("Informe um id de autor valido").optional(),
});

export type ListArticlesQueryDto = z.infer<typeof listArticlesQuerySchema>;
