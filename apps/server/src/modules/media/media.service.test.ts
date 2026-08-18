import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BadRequestError, ServiceUnavailableError } from "../../shared/errors";

import {
	MEDIA_MAX_SIZE_BYTES,
	MEDIA_UPLOAD_EXPIRES_IN_SECONDS,
	MediaService,
} from "./media.service";
import type { ObjectStorage, StoredObjectMetadata } from "./object-storage";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const pendingAvatarKey = `pending/${userId}/avatar/11111111-1111-4111-8111-111111111111.jpg`;

function createFakeStorage(
	metadata: StoredObjectMetadata | null = {
		contentType: "image/jpeg",
		sizeBytes: 1024,
	},
) {
	const copied: Array<{ source: string; destination: string }> = [];
	const deleted: string[] = [];
	const storage: ObjectStorage = {
		async createPresignedUpload(input) {
			return {
				url: "https://bucket.example.com",
				fields: { key: input.key, "Content-Type": input.contentType },
			};
		},
		async getMetadata() {
			return metadata;
		},
		async copy(source, destination) {
			copied.push({ source, destination });
		},
		async delete(key) {
			deleted.push(key);
		},
	};

	return { storage, copied, deleted };
}

describe("MediaService", () => {
	it("creates a short-lived upload owned by the authenticated user", async () => {
		const { storage } = createFakeStorage();
		const receivedInputs: Array<
			Parameters<ObjectStorage["createPresignedUpload"]>[0]
		> = [];
		const originalCreate = storage.createPresignedUpload;
		storage.createPresignedUpload = async (input) => {
			receivedInputs.push(input);
			return originalCreate(input);
		};
		const service = new MediaService(storage, "https://media.example.com/");

		const ticket = await service.createUpload(userId, "avatar", "image/webp");

		assert.match(
			ticket.objectKey,
			new RegExp(`^pending/${userId}/avatar/.+\\.webp$`),
		);
		assert.equal(ticket.url, "https://bucket.example.com");
		assert.equal(receivedInputs[0]?.contentType, "image/webp");
		assert.equal(receivedInputs[0]?.maxSizeBytes, MEDIA_MAX_SIZE_BYTES);
		assert.equal(
			receivedInputs[0]?.expiresInSeconds,
			MEDIA_UPLOAD_EXPIRES_IN_SECONDS,
		);
	});

	it("promotes a valid pending upload and removes the temporary object", async () => {
		const { storage, copied, deleted } = createFakeStorage();
		const service = new MediaService(storage, "https://media.example.com");

		const destination = await service.promotePendingUpload({
			userId,
			purpose: "avatar",
			pendingObjectKey: pendingAvatarKey,
			destinationOwnerId: userId,
		});

		assert.match(destination, new RegExp(`^avatars/${userId}/.+\\.jpg$`));
		assert.deepEqual(copied, [{ source: pendingAvatarKey, destination }]);
		assert.deepEqual(deleted, [pendingAvatarKey]);
		assert.equal(
			service.publicUrl(destination),
			`https://media.example.com/${destination}`,
		);
	});

	it("rejects pending keys owned by another user", async () => {
		const { storage } = createFakeStorage();
		const service = new MediaService(storage, "https://media.example.com");

		await assert.rejects(
			service.promotePendingUpload({
				userId: "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
				purpose: "avatar",
				pendingObjectKey: pendingAvatarKey,
				destinationOwnerId: userId,
			}),
			BadRequestError,
		);
	});

	it("rejects missing, oversized or mismatched uploaded objects", async () => {
		for (const metadata of [
			null,
			{ contentType: "image/png", sizeBytes: 1024 },
			{ contentType: "image/jpeg", sizeBytes: MEDIA_MAX_SIZE_BYTES + 1 },
		]) {
			const { storage } = createFakeStorage(metadata);
			const service = new MediaService(storage, "https://media.example.com");

			await assert.rejects(
				service.promotePendingUpload({
					userId,
					purpose: "avatar",
					pendingObjectKey: pendingAvatarKey,
					destinationOwnerId: userId,
				}),
				BadRequestError,
			);
		}
	});

	it("reports unavailable media configuration only when media is used", async () => {
		const service = new MediaService(null, null);

		await assert.rejects(
			service.createUpload(userId, "avatar", "image/jpeg"),
			ServiceUnavailableError,
		);
		assert.throws(() => service.publicUrl("avatars/user/image.jpg"), {
			name: "AppError",
		});
	});
});
