import { z } from "zod";

import {
	COURSE_MAX_LENGTH,
	INSTITUTION_MAX_LENGTH,
	MAX_SEMESTER,
} from "@/lib/academic-profile";
import { USER_BIO_MAX_LENGTH, USER_NAME_MAX_LENGTH } from "@/lib/user-profile";

const optionalNullableText = (maxLength: number, message?: string) =>
	z
		.string()
		.trim()
		.max(
			maxLength,
			message ?? `O campo deve ter no máximo ${maxLength} caracteres`,
		)
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
		.max(MAX_SEMESTER, "Informe um período válido")
		.nullable())
	.optional();

export const academicProfileSchema = z.object({
	course: z.string().nullable(),
	semester: z.number().int().nullable(),
	institution: z.string().nullable(),
});

export const profileIdSchema = z.uuid();

export const publicProfileSchema = z.object({
	id: profileIdSchema,
	name: z.string(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	academicProfile: academicProfileSchema.nullable(),
	createdAt: z.coerce.date(),
});

export const ownAccountSchema = publicProfileSchema.extend({
	email: z.email(),
	hasCustomAvatar: z.boolean(),
});

export const editProfileSchema = z
	.strictObject({
		name: z
			.string()
			.trim()
			.min(2, "O nome deve ter no mínimo 2 caracteres")
			.max(
				USER_NAME_MAX_LENGTH,
				`O nome deve ter no máximo ${USER_NAME_MAX_LENGTH} caracteres`,
			)
			.optional(),
		bio: optionalNullableText(USER_BIO_MAX_LENGTH),
		course: optionalNullableText(
			COURSE_MAX_LENGTH,
			`O curso deve ter no máximo ${COURSE_MAX_LENGTH} caracteres`,
		),
		semester: optionalNullableSemester,
		institution: optionalNullableText(
			INSTITUTION_MAX_LENGTH,
			`A instituição/campus deve ter no máximo ${INSTITUTION_MAX_LENGTH} caracteres`,
		),
	})
	.refine(
		(input) => Object.values(input).some((value) => value !== undefined),
		{
			message: "Informe ao menos um campo para atualizar",
		},
	);
