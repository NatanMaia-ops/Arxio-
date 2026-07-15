import { env } from "@arxio/env/server";
import { ExpressAuth, type ExpressAuthConfig } from "@auth/express";
import Google, { type GoogleProfile } from "@auth/express/providers/google";

const allowedDomains = ["aluno.uepb.edu.br", "uepb.edu.br"] as const;

function normalizeDomain(value: unknown): string | null {
	if (typeof value !== "string") return null;

	const domain = value.trim().toLowerCase();
	return domain || null;
}

function getEmailDomain(value: unknown): string | null {
	if (typeof value !== "string") return null;

	const email = value.trim().toLowerCase();
	const separator = email.lastIndexOf("@");

	if (
		separator <= 0 ||
		separator !== email.indexOf("@") ||
		separator === email.length - 1
	) {
		return null;
	}

	return email.slice(separator + 1);
}

function isAllowedDomain(domain: string | null): boolean {
	return (
		domain !== null &&
		allowedDomains.some((allowedDomain) => allowedDomain === domain)
	);
}

export const authConfig = {
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
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
		signIn({ account, profile }) {
			if (account?.provider !== "google" || !profile) return false;

			return (
				profile.email_verified === true &&
				isAllowedDomain(getEmailDomain(profile.email)) &&
				isAllowedDomain(normalizeDomain(profile.hd))
			);
		},
	},
	session: {
		strategy: "jwt",
	},
	secret: env.AUTH_SECRET,
} satisfies ExpressAuthConfig;

export const authHandler = ExpressAuth(authConfig);
