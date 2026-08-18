import { z } from "zod";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 200;
export const coverFitSchema = z.enum(["cover", "contain"]);

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
		.max(TITLE_MAX_LENGTH, "O título deve ter no máximo 200 caracteres"),
	content: z.string().trim().min(1, "O conteúdo não pode estar vazio"),
	coverFit: coverFitSchema,
});

export type ArticleInputSchema = z.infer<typeof articleInputSchema>;
