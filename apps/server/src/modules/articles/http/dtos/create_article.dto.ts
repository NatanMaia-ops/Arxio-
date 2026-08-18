import { z } from "zod";

export const coverFitSchema = z.enum(["cover", "contain"]);

export const createArticleSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, "O titulo deve ter no minimo 3 caracteres")
		.max(200, "O titulo deve ter no maximo 200 caracteres"),
	content: z.string().trim().min(1, "O conteudo nao pode estar vazio"),
	coverFit: coverFitSchema.default("cover"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
