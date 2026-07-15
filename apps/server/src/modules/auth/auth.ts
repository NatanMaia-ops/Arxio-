import { env } from "@arxio/env/server";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";

const allowedDomains = new Set(["aluno.uepb.edu.br", "uepb.edu.br"]);

type GoogleProfile = {
	email: string;
	email_verified: boolean;
	hd?: string;
	name: string;
};

const mapAccount = (profile: GoogleProfile) => {
	const email = profile.email.trim().toLowerCase();
	const emailDomain = email.slice(email.lastIndexOf("@") + 1);
	const hostedDomain = profile.hd?.trim().toLowerCase();

	if (
		!profile.email_verified ||
		!hostedDomain ||
		!allowedDomains.has(emailDomain) ||
		!allowedDomains.has(hostedDomain)
	) {
		throw new APIError("FORBIDDEN", {
			message: "Use uma conta institucional da UEPB para acessar a Arxio.",
		});
	}

	return {
		name: profile.name,
		email,
	};
};

export const auth = betterAuth({
	appName: "Arxio",
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.CORS_ORIGIN],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			hd: "*",
			mapProfileToUser: mapAccount,
		},
	},
});
