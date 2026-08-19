import { z } from "zod";

export const createTagSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "O nome da tag deve ter no minimo 2 caracteres")
		.max(50, "O nome da tag deve ter no maximo 50 caracteres"),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
