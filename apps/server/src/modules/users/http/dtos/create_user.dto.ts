import { z } from "zod";

export const createUserSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "O nome deve ter no mínimo 2 caracteres")
		.max(150, "O nome deve ter no máximo 150 caracteres"),

	email: z
		.email("Informe um e-mail válido")
		.trim()
		.toLowerCase()
		.max(255, "O e-mail deve ter no máximo 255 caracteres"),

	password: z
		.string()
		.min(8, "A senha deve ter no mínimo 8 caracteres")
		.max(72, "A senha deve ter no máximo 72 caracteres")
		.regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
		.regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
		.regex(/[0-9]/, "A senha deve conter ao menos um número"),

	enrollmentNumber: z
		.string()
		.trim()
		.max(50, "A matrícula deve ter no máximo 50 caracteres")
		.optional(),

	course: z
		.string()
		.trim()
		.max(150, "O curso deve ter no máximo 150 caracteres")
		.optional(),

	semester: z
		.number()
		.int("O semestre deve ser um número inteiro")
		.min(1, "O semestre deve ser no mínimo 1")
		.max(20, "Informe um semestre válido")
		.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
