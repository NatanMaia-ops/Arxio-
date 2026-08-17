import { likesStatusSchema } from "@/features/likes/schemas/like.schema";
import type { LikesStatus } from "@/features/likes/types/like.types";

export type LikesFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function likesUrl(serverUrl: string, articleId: string): string {
	return `${serverUrl.replace(/\/$/, "")}/articles/${articleId}/likes`;
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

export async function fetchLikesStatus(
	serverUrl: string,
	articleId: string,
	fetcher: LikesFetch = fetch,
): Promise<LikesStatus> {
	const response = await fetcher(likesUrl(serverUrl, articleId), {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) throw new Error("Failed to fetch likes status");

	const result = likesStatusSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid likes status response");

	return result.data;
}

export async function likeArticle(
	serverUrl: string,
	articleId: string,
	fetcher: LikesFetch = fetch,
): Promise<void> {
	const response = await fetcher(likesUrl(serverUrl, articleId), {
		method: "POST",
		credentials: "include",
	});

	if (response.status === 409) return;

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível curtir o artigo"),
		);
	}
}

export async function unlikeArticle(
	serverUrl: string,
	articleId: string,
	fetcher: LikesFetch = fetch,
): Promise<void> {
	const response = await fetcher(likesUrl(serverUrl, articleId), {
		method: "DELETE",
		credentials: "include",
	});

	if (response.status === 404) return;

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível remover a curtida"),
		);
	}
}
