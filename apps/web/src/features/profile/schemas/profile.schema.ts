import { z } from "zod";

const optionalNullableText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength, `O campo deve ter no máximo ${maxLength} caracteres`)
		.nullable()
		.transform((value) => value || null)
		.optional();

const optionalNullableSemester = z
	.preprocess((value) => {
		if (typeof value !== "string") return value;

		const normalized = value.trim();

		return normalized ? Number(normalized) : null;
	}, z
		.number()
		.int("O período deve ser um número inteiro")
		.min(1, "O período deve ser no mínimo 1")
		.max(20, "Informe um período válido")
		.nullable())
	.optional();

export const academicProfileSchema = z.object({
	course: z.string().nullable(),
	semester: z.number().int().nullable(),
	institution: z.string().nullable(),
});

export const publicProfileSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	academicProfile: academicProfileSchema.nullable(),
	createdAt: z.coerce.date(),
});

export const ownAccountSchema = publicProfileSchema.extend({
	email: z.email(),
});

export const editProfileSchema = z
	.strictObject({
		name: z
			.string()
			.trim()
			.min(2, "O nome deve ter no mínimo 2 caracteres")
			.max(150, "O nome deve ter no máximo 150 caracteres")
			.optional(),
		bio: optionalNullableText(500),
		course: optionalNullableText(150),
		semester: optionalNullableSemester,
		institution: optionalNullableText(150),
	})
	.refine(
		(input) => Object.values(input).some((value) => value !== undefined),
		{
			message: "Informe ao menos um campo para atualizar",
		},
	);
