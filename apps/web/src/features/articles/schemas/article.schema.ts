import { z } from "zod";

import {
	ARTICLE_CONTENT_MAX_LENGTH,
	countArticleContentCharacters,
} from "@/features/articles/article-content";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 100;
export const coverFitSchema = z.enum(["cover", "contain"]);

const articleContentSchema = z
	.string()
	.trim()
	.superRefine((content, context) => {
		const characterCount = countArticleContentCharacters(content);

		if (characterCount === 0) {
			context.addIssue({
				code: "custom",
				message: "O conteúdo não pode estar vazio",
			});
		}

		if (characterCount > ARTICLE_CONTENT_MAX_LENGTH) {
			context.addIssue({
				code: "custom",
				message: `O conteúdo deve ter no máximo ${ARTICLE_CONTENT_MAX_LENGTH.toLocaleString("pt-BR")} caracteres`,
			});
		}
	});

export const articleSchema = z.object({
	id: z.uuid(),
	authorId: z.uuid(),
	title: z.string(),
	content: z.string(),
	coverUrl: z.url().nullable(),
	coverFit: coverFitSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const articleListSchema = z.array(articleSchema);

export const authorSummarySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	avatarUrl: z.string().nullable(),
});

export const articleInputSchema = z.object({
	title: z
		.string()
		.trim()
		.min(TITLE_MIN_LENGTH, "O título deve ter no mínimo 3 caracteres")
		.max(
			TITLE_MAX_LENGTH,
			`O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres`,
		),
	content: articleContentSchema,
	coverFit: coverFitSchema,
});

export type ArticleInputSchema = z.infer<typeof articleInputSchema>;
