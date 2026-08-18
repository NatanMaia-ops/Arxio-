import { z } from "zod";

export const COMMENT_CONTENT_MAX_LENGTH = 300;

export const commentContentSchema = z
	.string()
	.trim()
	.min(1, "O comentario nao pode estar vazio")
	.max(
		COMMENT_CONTENT_MAX_LENGTH,
		`O comentario deve ter no maximo ${COMMENT_CONTENT_MAX_LENGTH} caracteres`,
	);
