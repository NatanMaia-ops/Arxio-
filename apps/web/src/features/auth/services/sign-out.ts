import { requestSignOut } from "@/features/auth/services/auth-api";
import { apiBaseUrl } from "@/lib/api-base-url";

export async function signOut(callbackUrl: string): Promise<string> {
	return requestSignOut(apiBaseUrl(), callbackUrl);
}
