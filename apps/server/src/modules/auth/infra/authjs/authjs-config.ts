import { env } from "@arxio/env/server";
import type { Adapter } from "@auth/core/adapters";
import type { ExpressAuthConfig } from "@auth/express";
import Google, { type GoogleProfile } from "@auth/express/providers/google";

import type { AuthService } from "../../auth.service";
import { canSignInWithGoogle } from "../../google-auth-policy";

export function createAuthConfig(
	adapter: Adapter,
	authService: AuthService,
): ExpressAuthConfig {
	return {
		adapter: {
			...adapter,
			createUser: (profile) => authService.createUserFromOAuth(profile),
			linkAccount: (account) => authService.linkAccount(account),
		},
		providers: [
			Google({
				clientId: env.AUTH_GOOGLE_ID,
				clientSecret: env.AUTH_GOOGLE_SECRET,
				allowDangerousEmailAccountLinking: true,
				profile(profile: GoogleProfile) {
					return {
						id: profile.sub,
						name: profile.name,
						email: profile.email.trim().toLowerCase(),
					};
				},
			}),
		],
		callbacks: {
			redirect({ url, baseUrl }) {
				const webOrigin = env.CORS_ORIGIN;

				if (url.startsWith(webOrigin) || url.startsWith(baseUrl)) return url;

				if (url.startsWith("/")) return `${webOrigin}${url}`;

				return webOrigin;
			},

			signIn({ account, profile }) {
				return canSignInWithGoogle(account, profile);
			},
			session({ session, user }) {
				return {
					expires: session.expires,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
				};
			},
		},
		session: {
			strategy: "database",
			maxAge: 30 * 24 * 60 * 60,
			updateAge: 24 * 60 * 60,
		},
		secret: env.AUTH_SECRET,
	};
}
