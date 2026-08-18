import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		PORT: z.coerce.number().default(3000),
		WEB_INTERNAL_URL: z.url().default("http://127.0.0.1:3001"),
		CORS_ORIGIN: z.url(),
		AUTH_URL: z.url(),
		AUTH_SECRET: z.string().min(32),
		JWT_SECRET: z.string().min(32),
		AUTH_GOOGLE_ID: z.string().min(1),
		AUTH_GOOGLE_SECRET: z.string().min(1),
		MEDIA_BUCKET: z.string().min(1).optional(),
		MEDIA_REGION: z.string().min(1).optional(),
		MEDIA_PUBLIC_BASE_URL: z.url().optional(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
