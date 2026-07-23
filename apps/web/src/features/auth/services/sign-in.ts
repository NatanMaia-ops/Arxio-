import { env } from "@arxio/env/web";

import { fetchCsrfToken } from "@/features/auth/services/auth-api";

export async function signInWithGoogle(callbackUrl: string): Promise<void> {
	const csrfToken = await fetchCsrfToken(env.NEXT_PUBLIC_SERVER_URL);

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
