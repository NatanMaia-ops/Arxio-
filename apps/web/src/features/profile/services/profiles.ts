import { env } from "@arxio/env/web";

import type { PublicProfile } from "@/features/profile/types/profile.types";

import { fetchPublicProfileById } from "./profile-api";

function apiUrl(): string {
	if (typeof window === "undefined") {
		return process.env.SERVER_INTERNAL_URL || env.NEXT_PUBLIC_SERVER_URL;
	}

	return env.NEXT_PUBLIC_SERVER_URL;
}

export function getPublicProfileById(
	id: string,
): Promise<PublicProfile | null> {
	return fetchPublicProfileById(apiUrl(), id);
}
