import { z } from "zod";

const optionalTextSchema = z
	.string()
	.trim()
	.max(150, "O campo deve ter no máximo 150 caracteres")
	.nullable()
	.optional()
	.transform((value) => value || null);

export const completeOnboardingSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "O nome deve ter no mínimo 2 caracteres")
		.max(150, "O nome deve ter no máximo 150 caracteres"),
	course: optionalTextSchema,
	semester: z
		.number()
		.int("O período deve ser um número inteiro")
		.min(1, "O período deve ser no mínimo 1")
		.max(20, "Informe um período válido")
		.nullable()
		.optional()
		.transform((value) => value ?? null),
	institution: optionalTextSchema,
});

export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>;
