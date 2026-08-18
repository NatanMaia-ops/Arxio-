import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MEDIA_MAX_SIZE_BYTES } from "../schemas/media.schema";
import { ImageValidationError, validateImageFile } from "./media";
import {
	MediaUploadError,
	requestMediaUpload,
	sendFileToStorage,
} from "./media-api";

function image(type: string, size: number): File {
	return new File([new Uint8Array(size)], "imagem", { type });
}

describe("Media", () => {
	it("accepts JPEG, PNG and WebP images", () => {
		for (const type of ["image/jpeg", "image/png", "image/webp"]) {
			assert.equal(validateImageFile(image(type, 10)), type);
		}
	});

	it("rejects SVG, GIF, empty and oversized files before upload", () => {
		for (const [file, reason] of [
			[image("image/svg+xml", 10), "format"],
			[image("image/gif", 10), "format"],
			[image("image/png", 0), "empty"],
			[image("image/png", MEDIA_MAX_SIZE_BYTES + 1), "size"],
		] as const) {
			assert.throws(
				() => validateImageFile(file),
				(error: unknown) => {
					assert.ok(error instanceof ImageValidationError);
					assert.equal(error.reason, reason);
					return true;
				},
			);
		}
	});

	it("requests and parses an upload ticket", async () => {
		const expiresAt = "2026-08-18T12:00:00.000Z";
		const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
			assert.equal(init?.credentials, "include");
			assert.deepEqual(JSON.parse(String(init?.body)), {
				purpose: "avatar",
				contentType: "image/jpeg",
				sizeBytes: 12,
			});
			return Response.json({
				objectKey: "pending/user/avatar/image.jpg",
				uploadUrl: "https://bucket.example.com",
				fields: { key: "pending/user/avatar/image.jpg" },
				expiresAt,
			});
		};

		const ticket = await requestMediaUpload(
			"http://localhost:3000/",
			{ purpose: "avatar", contentType: "image/jpeg", sizeBytes: 12 },
			fetcher,
		);
		assert.ok(ticket.expiresAt instanceof Date);
	});

	it("adds every S3 field before the file without setting Content-Type", async () => {
		const file = image("image/webp", 3);
		const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
			assert.equal(init?.credentials, "omit");
			assert.equal(new Headers(init?.headers).has("Content-Type"), false);
			assert.ok(init?.body instanceof FormData);
			const entries = Array.from(init.body.entries());
			assert.deepEqual(entries.slice(0, 2), [
				["key", "pending/image.webp"],
				["policy", "signed-policy"],
			]);
			assert.equal(entries[2]?.[0], "file");
			assert.equal(entries[2]?.[1], file);
			return new Response(null, { status: 204 });
		};

		await sendFileToStorage(
			{
				objectKey: "pending/image.webp",
				uploadUrl: "https://bucket.example.com",
				fields: { key: "pending/image.webp", policy: "signed-policy" },
				expiresAt: new Date(),
			},
			file,
			fetcher,
		);
	});

	it("distinguishes an expired session and an S3/CORS failure", async () => {
		await assert.rejects(
			requestMediaUpload(
				"http://localhost:3000",
				{ purpose: "avatar", contentType: "image/png", sizeBytes: 1 },
				async () => new Response(null, { status: 401 }),
			),
			(error: unknown) =>
				error instanceof MediaUploadError && error.kind === "unauthorized",
		);

		await assert.rejects(
			sendFileToStorage(
				{
					objectKey: "pending/image.png",
					uploadUrl: "https://bucket.example.com",
					fields: {},
					expiresAt: new Date(),
				},
				image("image/png", 1),
				async () => {
					throw new TypeError("Failed to fetch");
				},
			),
			(error: unknown) =>
				error instanceof MediaUploadError && error.kind === "storage_failed",
		);
	});
});
