import {
	CopyObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import type {
	CreatePresignedUploadInput,
	ObjectStorage,
} from "../object-storage";

export function createS3ObjectStorage(input: {
	bucket: string;
	region: string;
}): ObjectStorage {
	const client = new S3Client({ region: input.region });

	return {
		async createPresignedUpload(upload: CreatePresignedUploadInput) {
			const result = await createPresignedPost(client, {
				Bucket: input.bucket,
				Key: upload.key,
				Expires: upload.expiresInSeconds,
				Fields: {
					"Content-Type": upload.contentType,
					"Cache-Control": "public, max-age=31536000, immutable",
				},
				Conditions: [
					["content-length-range", 1, upload.maxSizeBytes],
					["eq", "$Content-Type", upload.contentType],
					["eq", "$Cache-Control", "public, max-age=31536000, immutable"],
				],
			});

			return { url: result.url, fields: result.fields };
		},

		async getMetadata(key: string) {
			try {
				const result = await client.send(
					new HeadObjectCommand({ Bucket: input.bucket, Key: key }),
				);

				return {
					contentType: result.ContentType ?? null,
					sizeBytes: result.ContentLength ?? 0,
				};
			} catch (error) {
				if (
					typeof error === "object" &&
					error !== null &&
					"name" in error &&
					(error.name === "NotFound" || error.name === "NoSuchKey")
				) {
					return null;
				}

				throw error;
			}
		},

		async copy(sourceKey: string, destinationKey: string) {
			await client.send(
				new CopyObjectCommand({
					Bucket: input.bucket,
					CopySource: `${input.bucket}/${sourceKey}`,
					Key: destinationKey,
				}),
			);
		},

		async delete(key: string) {
			await client.send(
				new DeleteObjectCommand({ Bucket: input.bucket, Key: key }),
			);
		},
	};
}
