import { env } from "@arxio/env/web";

import {
	type AuthSession,
	fetchSession,
} from "@/features/auth/services/auth-api";

export function getSession(): Promise<AuthSession | null> {
	return fetchSession(env.NEXT_PUBLIC_SERVER_URL);
}
