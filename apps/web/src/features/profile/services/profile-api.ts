import type { ZodType } from "zod";

import {
	ownAccountSchema,
	publicProfileSchema,
} from "@/features/profile/schemas/profile.schema";
import type {
	OwnAccount,
	PublicProfile,
	UpdateProfileInput,
} from "@/features/profile/types/profile.types";

export type ProfileFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export type ProfileApiErrorKind =
	| "unauthorized"
	| "not_found"
	| "invalid_response"
	| "request_failed";

export class ProfileApiError extends Error {
	constructor(
		public readonly kind: ProfileApiErrorKind,
		message: string,
		public readonly status?: number,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "ProfileApiError";
	}
}

function profileUrl(serverUrl: string, path: string): string {
	return `${serverUrl.replace(/\/$/, "")}/users/${path}`;
}

async function request(
	fetcher: ProfileFetch,
	input: RequestInfo | URL,
	init: RequestInit,
): Promise<Response> {
	try {
		return await fetcher(input, init);
	} catch (cause) {
		throw new ProfileApiError(
			"request_failed",
			"Não foi possível acessar o serviço de perfis",
			undefined,
			{ cause },
		);
	}
}

async function readErrorMessage(
	response: Response,
	fallback: string,
): Promise<string> {
	try {
		const data: unknown = await response.json();

		if (
			typeof data === "object" &&
			data !== null &&
			"message" in data &&
			typeof data.message === "string"
		) {
			return data.message;
		}
	} catch {
		return fallback;
	}

	return fallback;
}

async function responseError(response: Response): Promise<ProfileApiError> {
	if (response.status === 401) {
		return new ProfileApiError(
			"unauthorized",
			await readErrorMessage(response, "Autenticação necessária"),
			response.status,
		);
	}

	if (response.status === 404) {
		return new ProfileApiError(
			"not_found",
			await readErrorMessage(response, "Perfil não encontrado"),
			response.status,
		);
	}

	return new ProfileApiError(
		"request_failed",
		await readErrorMessage(response, "Não foi possível acessar o perfil"),
		response.status,
	);
}

async function parseResponse<T>(
	response: Response,
	schema: ZodType<T>,
): Promise<T> {
	let data: unknown;

	try {
		data = await response.json();
	} catch (cause) {
		throw new ProfileApiError(
			"invalid_response",
			"Resposta de perfil inválida",
			response.status,
			{ cause },
		);
	}

	const result = schema.safeParse(data);

	if (!result.success) {
		throw new ProfileApiError(
			"invalid_response",
			"Resposta de perfil inválida",
			response.status,
			{ cause: result.error },
		);
	}

	return result.data;
}

export async function fetchPublicProfileById(
	serverUrl: string,
	id: string,
	fetcher: ProfileFetch = fetch,
): Promise<PublicProfile | null> {
	const response = await request(
		fetcher,
		profileUrl(serverUrl, `${encodeURIComponent(id)}/profile`),
		{
			credentials: "include",
			cache: "no-store",
		},
	);

	if (response.status === 404) return null;
	if (!response.ok) throw await responseError(response);

	return parseResponse(response, publicProfileSchema);
}

export async function fetchOwnAccount(
	serverUrl: string,
	fetcher: ProfileFetch = fetch,
): Promise<OwnAccount> {
	const response = await request(fetcher, profileUrl(serverUrl, "me"), {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) throw await responseError(response);

	return parseResponse(response, ownAccountSchema);
}

export async function updateOwnProfile(
	serverUrl: string,
	input: UpdateProfileInput,
	fetcher: ProfileFetch = fetch,
): Promise<OwnAccount> {
	const response = await request(fetcher, profileUrl(serverUrl, "me"), {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!response.ok) throw await responseError(response);

	return parseResponse(response, ownAccountSchema);
}

export async function confirmOwnAvatar(
	serverUrl: string,
	objectKey: string,
	fetcher: ProfileFetch = fetch,
): Promise<OwnAccount> {
	const response = await request(fetcher, profileUrl(serverUrl, "me/avatar"), {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ objectKey }),
	});

	if (!response.ok) throw await responseError(response);
	return parseResponse(response, ownAccountSchema);
}

export async function removeOwnAvatar(
	serverUrl: string,
	fetcher: ProfileFetch = fetch,
): Promise<OwnAccount> {
	const response = await request(fetcher, profileUrl(serverUrl, "me/avatar"), {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) throw await responseError(response);
	return parseResponse(response, ownAccountSchema);
}
