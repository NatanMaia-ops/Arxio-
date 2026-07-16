import { db } from "@arxio/db";
import { accounts, sessions, verificationTokens } from "@arxio/db/schema/auth";
import { users } from "@arxio/db/schema/user";
import { env } from "@arxio/env/server";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { ExpressAuth, type ExpressAuthConfig, getSession } from "@auth/express";
import Google, { type GoogleProfile } from "@auth/express/providers/google";

import { type AuthPersistence, AuthService } from "./modules/auth/auth.service";

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

const drizzleAuthAdapter = DrizzleAdapter(db, {
	usersTable: users,
	accountsTable: accounts,
	sessionsTable: sessions,
	verificationTokensTable: verificationTokens,
});

if (
	!drizzleAuthAdapter.createUser ||
	!drizzleAuthAdapter.getUser ||
	!drizzleAuthAdapter.getUserByAccount ||
	!drizzleAuthAdapter.getUserByEmail ||
	!drizzleAuthAdapter.linkAccount
) {
	throw new Error("Auth adapter is missing required methods");
}

export const authService: AuthService = new AuthService(
	{
		createUser: drizzleAuthAdapter.createUser,
		getUser: drizzleAuthAdapter.getUser,
		getUserByAccount: drizzleAuthAdapter.getUserByAccount,
		getUserByEmail: drizzleAuthAdapter.getUserByEmail,
		linkAccount: drizzleAuthAdapter.linkAccount,
	} satisfies AuthPersistence,
	(request) => getSession(request, authConfig),
);

export const authConfig: ExpressAuthConfig = {
	adapter: {
		...drizzleAuthAdapter,
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
		signIn({ account, profile }) {
			if (account?.provider !== "google" || !profile) return false;

			return (
				profile.email_verified === true &&
				isAllowedDomain(getEmailDomain(profile.email)) &&
				isAllowedDomain(normalizeDomain(profile.hd))
			);
		},
		session({ session, token }) {
			if (!session.user || !token.sub) return session;

			return {
				...session,
				user: {
					...session.user,
					id: token.sub,
				},
			};
		},
	},
	session: {
		strategy: "jwt",
	},
	secret: env.AUTH_SECRET,
};

export const authHandler = ExpressAuth(authConfig);
