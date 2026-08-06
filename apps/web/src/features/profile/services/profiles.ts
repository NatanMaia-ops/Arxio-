import type {
	OwnAccount,
	PublicProfile,
	UpdateProfileInput,
} from "@/features/profile/types/profile.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import {
	fetchOwnAccount,
	fetchPublicProfileById,
	updateOwnProfile,
} from "./profile-api";

export function getPublicProfileById(
	id: string,
): Promise<PublicProfile | null> {
	return fetchPublicProfileById(apiUrl(), id);
}

export function getOwnAccount(): Promise<OwnAccount> {
	return fetchOwnAccount(apiUrl());
}

export function saveOwnProfile(input: UpdateProfileInput): Promise<OwnAccount> {
	return updateOwnProfile(apiUrl(), input);
}
