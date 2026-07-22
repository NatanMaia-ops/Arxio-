type AuthFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function authUrl(serverUrl: string, path: string): string {
	return `${serverUrl.replace(/\/$/, "")}/auth/${path}`;
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
