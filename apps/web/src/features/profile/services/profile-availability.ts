import type { ProfileFetch } from "./profile-api";

export type PublicProfileAvailability =
	| "available"
	| "not_found"
	| "unavailable";

export async function checkPublicProfileAvailability(
	serverUrl: string,
	id: string,
	fetcher: ProfileFetch = fetch,
	signal?: AbortSignal,
): Promise<PublicProfileAvailability> {
	try {
		const response = await fetcher(
			`${serverUrl.replace(/\/$/, "")}/users/${encodeURIComponent(id)}/profile`,
			{
				method: "HEAD",
				headers: { Accept: "application/json" },
				cache: "no-store",
				signal,
			},
		);

		if (response.status === 404) return "not_found";
		if (response.ok) return "available";

		return "unavailable";
	} catch {
		return "unavailable";
	}
}
