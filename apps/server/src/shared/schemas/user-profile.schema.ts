import { z } from "zod";

export const USER_NAME_MAX_LENGTH = 60;
export const USER_BIO_MAX_LENGTH = 300;

export const userNameSchema = z
	.string()
	.trim()
	.min(2, "O nome deve ter no mínimo 2 caracteres")
	.max(
		USER_NAME_MAX_LENGTH,
		`O nome deve ter no máximo ${USER_NAME_MAX_LENGTH} caracteres`,
	);

export const optionalUserBioSchema = z
	.string()
	.trim()
	.max(
		USER_BIO_MAX_LENGTH,
		`O campo deve ter no máximo ${USER_BIO_MAX_LENGTH} caracteres`,
	)
	.nullable()
	.optional()
	.transform((value) => {
		if (value === undefined) return undefined;
		return value || null;
	});
