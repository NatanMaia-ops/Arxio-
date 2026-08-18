import { z } from "zod";

export const MAX_SEMESTER = 10;

export const semesterSchema = z
	.number()
	.int("O período deve ser um número inteiro")
	.min(1, "O período deve ser no mínimo 1")
	.max(MAX_SEMESTER, "Informe um período válido");
