import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import express from "express";

import { errorHandler } from "../../../shared/http/error-handler";
import { createRequireAuth } from "../../auth/http/auth.middleware";
import { MediaService } from "../media.service";
import type { ObjectStorage } from "../object-storage";

import { createMediaController } from "./media.controller";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";

const storage: ObjectStorage = {
	async createPresignedUpload(input) {
		return {
			url: "https://bucket.example.com",
			fields: { key: input.key, "Content-Type": input.contentType },
		};
	},
	async getMetadata() {
		return null;
	},
	async copy() {},
	async delete() {},
};

describe("Media HTTP API", () => {
	let origin = "";
	let server: Server;

	before(async () => {
		const app = express();
		const service = new MediaService(storage, "https://media.example.com");

		app.use(express.json());
		app.use(
			"/media",
			createMediaController(
				service,
				createRequireAuth(async () => ({
					user: { id: userId },
					expires: new Date(Date.now() + 3600_000).toISOString(),
				})),
			),
		);
		app.use(
			"/anonymous-media",
			createMediaController(
				service,
				createRequireAuth(async () => null),
			),
		);
		app.use(errorHandler);

		server = await new Promise<Server>((resolve, reject) => {
			const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
			listener.once("error", reject);
		});

		const address = server.address();
		assert.ok(address && typeof address === "object");
		origin = `http://127.0.0.1:${address.port}`;
	});

	after(
		() =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			}),
	);

	it("requires authentication to request an upload", async () => {
		const response = await fetch(`${origin}/anonymous-media/uploads`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				purpose: "avatar",
				contentType: "image/jpeg",
				sizeBytes: 1024,
			}),
		});

		assert.equal(response.status, 401);
	});

	it("returns the S3 form fields for a valid image", async () => {
		const response = await fetch(`${origin}/media/uploads`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				purpose: "article-cover",
				contentType: "image/webp",
				sizeBytes: 2048,
			}),
		});
		const body = (await response.json()) as Record<string, unknown>;

		assert.equal(response.status, 201);
		assert.equal(body.uploadUrl, "https://bucket.example.com");
		assert.match(
			body.objectKey as string,
			new RegExp(`^pending/${userId}/article-cover/.+\\.webp$`),
		);
		assert.ok(body.fields);
		assert.ok(body.expiresAt);
	});

	it("rejects unsupported types and files larger than 5 MB", async () => {
		for (const payload of [
			{ purpose: "avatar", contentType: "image/svg+xml", sizeBytes: 100 },
			{
				purpose: "avatar",
				contentType: "image/png",
				sizeBytes: 6 * 1024 * 1024,
			},
		]) {
			const response = await fetch(`${origin}/media/uploads`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			assert.equal(response.status, 400);
		}
	});
});
