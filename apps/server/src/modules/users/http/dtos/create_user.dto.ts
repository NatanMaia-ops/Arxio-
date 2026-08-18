import { z } from "zod";

import { courseTextSchema } from "../../../../shared/schemas/academic-profile.schema";
import { semesterSchema } from "../../../../shared/schemas/semester.schema";
import { userNameSchema } from "../../../../shared/schemas/user-profile.schema";

export const createUserSchema = z.object({
	name: userNameSchema,

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

	course: courseTextSchema.optional(),

	semester: semesterSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
