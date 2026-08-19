import { z } from "zod";

export const setArticleTagsSchema = z.object({
	tagIds: z
		.array(z.string().uuid())
		.max(10, "Um artigo pode ter no maximo 10 tags"),
});

export type SetArticleTagsInput = z.infer<typeof setArticleTagsSchema>;
