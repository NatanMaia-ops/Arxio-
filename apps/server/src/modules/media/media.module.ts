import { env } from "@arxio/env/server";

import { createS3ObjectStorage } from "./infra/s3-object-storage";
import { MediaService } from "./media.service";

const hasMediaConfiguration =
	Boolean(env.MEDIA_BUCKET) &&
	Boolean(env.MEDIA_REGION) &&
	Boolean(env.MEDIA_PUBLIC_BASE_URL);

const objectStorage = hasMediaConfiguration
	? createS3ObjectStorage({
			bucket: env.MEDIA_BUCKET as string,
			region: env.MEDIA_REGION as string,
		})
	: null;

export const mediaService = new MediaService(
	objectStorage,
	env.MEDIA_PUBLIC_BASE_URL ?? null,
);
