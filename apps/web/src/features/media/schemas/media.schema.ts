import { z } from "zod";

export const MEDIA_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp";

export const mediaPurposeSchema = z.enum(["avatar", "article-cover"]);
export const supportedImageTypeSchema = z.enum([
	"image/jpeg",
	"image/png",
	"image/webp",
]);

export const mediaUploadTicketSchema = z.object({
	objectKey: z.string().min(1),
	uploadUrl: z.url(),
	fields: z.record(z.string(), z.string()),
	expiresAt: z.coerce.date(),
});
