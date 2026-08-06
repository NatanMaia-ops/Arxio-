import { env } from "@arxio/env/web";

export function apiBaseUrl(): string {
	if (typeof window !== "undefined") {
		return env.NEXT_PUBLIC_SERVER_URL ?? "";
	}

	return process.env.SERVER_INTERNAL_URL ?? "http://127.0.0.1:3000";
}
