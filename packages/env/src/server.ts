import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		CORS_ORIGIN: z.url(),
		AUTH_URL: z.url(),
		AUTH_SECRET: z.string().min(32),
		JWT_SECRET: z.string().min(32),
		AUTH_GOOGLE_ID: z.string().min(1),
		AUTH_GOOGLE_SECRET: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
