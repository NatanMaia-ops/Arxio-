import { z } from "zod";

export const COURSE_MAX_LENGTH = 45;
export const INSTITUTION_MAX_LENGTH = 60;

export const courseTextSchema = z
	.string()
	.trim()
	.max(
		COURSE_MAX_LENGTH,
		`O curso deve ter no máximo ${COURSE_MAX_LENGTH} caracteres`,
	);

export const institutionTextSchema = z
	.string()
	.trim()
	.max(
		INSTITUTION_MAX_LENGTH,
		`A instituição/campus deve ter no máximo ${INSTITUTION_MAX_LENGTH} caracteres`,
	);
