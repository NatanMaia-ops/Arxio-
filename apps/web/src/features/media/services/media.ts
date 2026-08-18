import {
	MEDIA_MAX_SIZE_BYTES,
	supportedImageTypeSchema,
} from "@/features/media/schemas/media.schema";
import type {
	MediaPurpose,
	MediaUploadStage,
	SupportedImageType,
} from "@/features/media/types/media.types";
import { apiBaseUrl } from "@/lib/api-base-url";

import { requestMediaUpload, sendFileToStorage } from "./media-api";

export class ImageValidationError extends Error {
	constructor(public readonly reason: "empty" | "format" | "size") {
		super(
			reason === "empty"
				? "O arquivo selecionado está vazio"
				: reason === "size"
					? "A imagem deve ter no máximo 5 MB"
					: "Use uma imagem JPEG, PNG ou WebP",
		);
		this.name = "ImageValidationError";
	}
}

export function validateImageFile(file: File): SupportedImageType {
	if (file.size === 0) throw new ImageValidationError("empty");
	if (file.size > MEDIA_MAX_SIZE_BYTES) throw new ImageValidationError("size");

	const contentType = supportedImageTypeSchema.safeParse(file.type);
	if (!contentType.success) throw new ImageValidationError("format");

	return contentType.data;
}

export async function uploadImage(
	file: File,
	purpose: MediaPurpose,
	onStage?: (stage: MediaUploadStage) => void,
): Promise<string> {
	const contentType = validateImageFile(file);
	onStage?.("preparing");
	const ticket = await requestMediaUpload(apiBaseUrl(), {
		purpose,
		contentType,
		sizeBytes: file.size,
	});

	onStage?.("uploading");
	await sendFileToStorage(ticket, file);
	return ticket.objectKey;
}
