import { env } from "@arxio/env/server";
import { ExpressAuth, type ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";

export const authConfig = {
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: env.AUTH_SECRET,
} satisfies ExpressAuthConfig;

export const authHandler = ExpressAuth(authConfig);
