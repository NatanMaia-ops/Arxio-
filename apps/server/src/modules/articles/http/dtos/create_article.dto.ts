import { z } from "zod";

import {
	ARTICLE_CONTENT_MAX_LENGTH,
	countArticleContentCharacters,
} from "../../article-content";

export const coverFitSchema = z.enum(["cover", "contain"]);
export const ARTICLE_TITLE_MAX_LENGTH = 100;

const articleContentSchema = z
	.string()
	.trim()
	.superRefine((content, context) => {
		const characterCount = countArticleContentCharacters(content);

		if (characterCount === 0) {
			context.addIssue({
				code: "custom",
				message: "O conteudo nao pode estar vazio",
			});
		}

		if (characterCount > ARTICLE_CONTENT_MAX_LENGTH) {
			context.addIssue({
				code: "custom",
				message: `O conteudo deve ter no maximo ${ARTICLE_CONTENT_MAX_LENGTH} caracteres`,
			});
		}
	});

export const createArticleSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "O titulo deve ter no minimo 3 caracteres")
		.max(
			ARTICLE_TITLE_MAX_LENGTH,
			`O titulo deve ter no maximo ${ARTICLE_TITLE_MAX_LENGTH} caracteres`,
		),
	content: articleContentSchema,
	coverFit: coverFitSchema.default("cover"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
