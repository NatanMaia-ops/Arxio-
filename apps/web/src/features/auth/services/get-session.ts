import {
	type AuthSession,
	fetchSession,
} from "@/features/auth/services/auth-api";
import { apiBaseUrl } from "@/lib/api-base-url";

export function getSession(): Promise<AuthSession | null> {
	return fetchSession(apiBaseUrl());
}
