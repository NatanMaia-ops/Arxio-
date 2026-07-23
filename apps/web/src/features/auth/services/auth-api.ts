type AuthFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export type AuthSession = {
	expires: string;
	user: {
		id: string;
		name: string | null;
		email: string | null;
		image: string | null;
	};
};

function authUrl(serverUrl: string, path: string): string {
	return `${serverUrl.replace(/\/$/, "")}/auth/${path}`;
}

function isNullableString(value: unknown): value is string | null {
	return typeof value === "string" || value === null;
}

function isAuthSession(value: unknown): value is AuthSession {
	if (typeof value !== "object" || value === null) return false;
	if (!("expires" in value) || typeof value.expires !== "string") return false;
	if (!("user" in value) || typeof value.user !== "object" || !value.user) {
		return false;
	}

	const { user } = value;

	return (
		"id" in user &&
		typeof user.id === "string" &&
		"name" in user &&
		isNullableString(user.name) &&
		"email" in user &&
		isNullableString(user.email) &&
		"image" in user &&
		isNullableString(user.image)
	);
}

export async function fetchSession(
	serverUrl: string,
	fetcher: AuthFetch = fetch,
): Promise<AuthSession | null> {
	const response = await fetcher(authUrl(serverUrl, "session"), {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch session");
	}

	const data: unknown = await response.json();

	if (data === null) return null;
	if (!isAuthSession(data)) throw new Error("Invalid session response");

	return data;
}

export async function fetchCsrfToken(
	serverUrl: string,
	fetcher: AuthFetch = fetch,
): Promise<string> {
	const response = await fetcher(authUrl(serverUrl, "csrf"), {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to obtain CSRF token");
	}

	const data: unknown = await response.json();

	if (
		typeof data !== "object" ||
		data === null ||
		!("csrfToken" in data) ||
		typeof data.csrfToken !== "string"
	) {
		throw new Error("Invalid CSRF response");
	}

	return data.csrfToken;
}

export async function requestSignOut(
	serverUrl: string,
	callbackUrl: string,
	fetcher: AuthFetch = fetch,
): Promise<string> {
	const csrfToken = await fetchCsrfToken(serverUrl, fetcher);
	const body = new URLSearchParams({ csrfToken, callbackUrl });
	const response = await fetcher(authUrl(serverUrl, "signout"), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"X-Auth-Return-Redirect": "1",
		},
		body,
	});

	if (!response.ok) {
		throw new Error("Failed to sign out");
	}

	const data: unknown = await response.json();

	if (
		typeof data !== "object" ||
		data === null ||
		!("url" in data) ||
		typeof data.url !== "string"
	) {
		throw new Error("Invalid sign-out response");
	}

	try {
		return new URL(data.url).toString();
	} catch {
		throw new Error("Invalid sign-out response");
	}
}
