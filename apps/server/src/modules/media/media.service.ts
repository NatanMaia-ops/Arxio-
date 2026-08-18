import crypto from "node:crypto";

import { BadRequestError, ServiceUnavailableError } from "../../shared/errors";

import type { ObjectStorage, PresignedUpload } from "./object-storage";

export const MEDIA_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const MEDIA_UPLOAD_EXPIRES_IN_SECONDS = 5 * 60;

export const mediaPurposeSchemaValues = ["avatar", "article-cover"] as const;
export type MediaPurpose = (typeof mediaPurposeSchemaValues)[number];

const contentTypeExtensions = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
} as const;

export type SupportedImageContentType = keyof typeof contentTypeExtensions;

export type MediaUploadTicket = PresignedUpload & {
	objectKey: string;
	expiresAt: Date;
};

export class MediaService {
	constructor(
		private readonly storage: ObjectStorage | null,
		private readonly publicBaseUrl: string | null,
	) {}

	async createUpload(
		userId: string,
		purpose: MediaPurpose,
		contentType: SupportedImageContentType,
	): Promise<MediaUploadTicket> {
		const storage = this.requireStorage();
		const extension = contentTypeExtensions[contentType];
		const objectKey = `pending/${userId}/${purpose}/${crypto.randomUUID()}.${extension}`;
		const upload = await storage.createPresignedUpload({
			key: objectKey,
			contentType,
			maxSizeBytes: MEDIA_MAX_SIZE_BYTES,
			expiresInSeconds: MEDIA_UPLOAD_EXPIRES_IN_SECONDS,
		});

		return {
			...upload,
			objectKey,
			expiresAt: new Date(Date.now() + MEDIA_UPLOAD_EXPIRES_IN_SECONDS * 1000),
		};
	}

	async promotePendingUpload(input: {
		userId: string;
		purpose: MediaPurpose;
		pendingObjectKey: string;
		destinationOwnerId: string;
	}): Promise<string> {
		const storage = this.requireStorage();
		const extension = this.assertOwnedPendingKey(
			input.pendingObjectKey,
			input.userId,
			input.purpose,
		);
		const metadata = await storage.getMetadata(input.pendingObjectKey);

		if (!metadata) {
			throw new BadRequestError("Upload de imagem nao encontrado ou expirado");
		}

		const expectedContentType = this.contentTypeForExtension(extension);

		if (
			metadata.contentType !== expectedContentType ||
			metadata.sizeBytes <= 0 ||
			metadata.sizeBytes > MEDIA_MAX_SIZE_BYTES
		) {
			throw new BadRequestError("A imagem enviada nao atende aos requisitos");
		}

		const destinationPrefix =
			input.purpose === "avatar" ? "avatars" : "article-covers";
		const destinationKey = `${destinationPrefix}/${input.destinationOwnerId}/${crypto.randomUUID()}.${extension}`;

		await storage.copy(input.pendingObjectKey, destinationKey);
		await this.deleteBestEffort(input.pendingObjectKey);

		return destinationKey;
	}

	publicUrl(objectKey: string): string {
		if (!this.publicBaseUrl) {
			throw new ServiceUnavailableError(
				"O servico de imagens nao esta configurado",
			);
		}

		return `${this.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
	}

	async deleteBestEffort(objectKey: string | null): Promise<void> {
		if (!objectKey || !this.storage) return;

		try {
			await this.storage.delete(objectKey);
		} catch (error) {
			console.error("Failed to delete media object", { objectKey, error });
		}
	}

	private requireStorage(): ObjectStorage {
		if (!this.storage) {
			throw new ServiceUnavailableError(
				"O servico de imagens nao esta configurado",
			);
		}

		return this.storage;
	}

	private assertOwnedPendingKey(
		objectKey: string,
		userId: string,
		purpose: MediaPurpose,
	): "jpg" | "png" | "webp" {
		const escapedUserId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const pattern = new RegExp(
			`^pending/${escapedUserId}/${purpose}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)$`,
		);
		const match = objectKey.match(pattern);

		if (!match?.[1]) {
			throw new BadRequestError("Chave de upload invalida para este usuario");
		}

		return match[1] as "jpg" | "png" | "webp";
	}

	private contentTypeForExtension(
		extension: "jpg" | "png" | "webp",
	): SupportedImageContentType {
		if (extension === "jpg") return "image/jpeg";
		return `image/${extension}`;
	}
}
