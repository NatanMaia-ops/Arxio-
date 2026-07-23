import { env } from "@arxio/env/web";

import { requestSignOut } from "@/features/auth/services/auth-api";

export async function signOut(callbackUrl: string): Promise<string> {
	return requestSignOut(env.NEXT_PUBLIC_SERVER_URL, callbackUrl);
}
