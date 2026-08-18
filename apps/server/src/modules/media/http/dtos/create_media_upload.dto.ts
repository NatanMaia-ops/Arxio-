import { z } from "zod";

import {
	MEDIA_MAX_SIZE_BYTES,
	mediaPurposeSchemaValues,
} from "../../media.service";

export const supportedImageContentTypeSchema = z.enum([
	"image/jpeg",
	"image/png",
	"image/webp",
]);

export const createMediaUploadSchema = z.strictObject({
	purpose: z.enum(mediaPurposeSchemaValues),
	contentType: supportedImageContentTypeSchema,
	sizeBytes: z
		.number()
		.int()
		.positive("A imagem deve possuir conteudo")
		.max(MEDIA_MAX_SIZE_BYTES, "A imagem deve ter no maximo 5 MB"),
});

export const mediaUploadResponseSchema = z.object({
	objectKey: z.string(),
	uploadUrl: z.url(),
	fields: z.record(z.string(), z.string()),
	expiresAt: z.coerce.date(),
});
