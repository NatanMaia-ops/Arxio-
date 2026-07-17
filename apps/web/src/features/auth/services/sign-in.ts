import { env } from "@arxio/env/web";

async function fetchCsrfToken(): Promise<string> {
	const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/auth/csrf`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to obtain CSRF token");
	}

	const { csrfToken } = (await response.json()) as { csrfToken: string };
	return csrfToken;
}

export async function signInWithGoogle(callbackUrl: string): Promise<void> {
	const csrfToken = await fetchCsrfToken();

	const form = document.createElement("form");
	form.method = "POST";
	form.action = `${env.NEXT_PUBLIC_SERVER_URL}/auth/signin/google`;

	for (const [name, value] of Object.entries({ csrfToken, callbackUrl })) {
		const field = document.createElement("input");
		field.type = "hidden";
		field.name = name;
		field.value = value;
		form.appendChild(field);
	}

	document.body.appendChild(form);
	form.submit();
}
