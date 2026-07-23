type OAuthAccount =
	| {
			provider?: string | null;
	  }
	| null
	| undefined;

type OAuthProfile =
	| {
			email?: unknown;
			email_verified?: unknown;
			hd?: unknown;
	  }
	| null
	| undefined;

export function canSignInWithGoogle(
	account: OAuthAccount,
	profile: OAuthProfile,
): boolean {
	return account?.provider === "google" && profile?.email_verified === true;
}
