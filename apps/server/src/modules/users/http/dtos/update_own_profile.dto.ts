import { z } from "zod";

const optionalNullableText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength, `O campo deve ter no máximo ${maxLength} caracteres`)
		.nullable()
		.optional()
		.transform((value) => {
			if (value === undefined) return undefined;
			return value || null;
		});

export const updateOwnProfileSchema = z
	.strictObject({
		name: z
			.string()
			.trim()
			.min(2, "O nome deve ter no mínimo 2 caracteres")
			.max(150, "O nome deve ter no máximo 150 caracteres")
			.optional(),
		bio: optionalNullableText(500),
		course: optionalNullableText(150),
		semester: z
			.number()
			.int("O período deve ser um número inteiro")
			.min(1, "O período deve ser no mínimo 1")
			.max(20, "Informe um período válido")
			.nullable()
			.optional(),
		institution: optionalNullableText(150),
	})
	.refine(
		(input) => Object.values(input).some((value) => value !== undefined),
		{
			message: "Informe ao menos um campo para atualizar",
		},
	);

export type UpdateOwnProfileDto = z.infer<typeof updateOwnProfileSchema>;
