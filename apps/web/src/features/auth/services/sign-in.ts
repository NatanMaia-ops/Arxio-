import { fetchCsrfToken } from "@/features/auth/services/auth-api";
import { apiBaseUrl } from "@/lib/api-base-url";

export async function signInWithGoogle(callbackUrl: string): Promise<void> {
	const serverUrl = apiBaseUrl();
	const csrfToken = await fetchCsrfToken(serverUrl);

	const form = document.createElement("form");
	form.method = "POST";
	form.action = `${serverUrl}/auth/signin/google`;

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
