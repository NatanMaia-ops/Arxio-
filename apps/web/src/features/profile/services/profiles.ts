import type {
	OwnAccount,
	PublicProfile,
	UpdateProfileInput,
} from "@/features/profile/types/profile.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import {
	confirmOwnAvatar,
	fetchOwnAccount,
	fetchPublicProfileById,
	removeOwnAvatar,
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

export function saveOwnAvatar(objectKey: string): Promise<OwnAccount> {
	return confirmOwnAvatar(apiUrl(), objectKey);
}

export function deleteOwnAvatar(): Promise<OwnAccount> {
	return removeOwnAvatar(apiUrl());
}
