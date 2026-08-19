import { tagListSchema } from "@/features/tags/schemas/tag.schema";
import type { Tag } from "@/features/tags/types/tag.types";

export type TagFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function tagsUrl(serverUrl: string): string {
	return `${serverUrl.replace(/\/$/, "")}/tags`;
}

export async function fetchTags(
	serverUrl: string,
	fetcher: TagFetch = fetch,
): Promise<Tag[]> {
	const response = await fetcher(tagsUrl(serverUrl), {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) throw new Error("Failed to fetch tags");

	const result = tagListSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid tags response");

	return result.data;
}

export async function fetchArticleTags(
	serverUrl: string,
	articleId: string,
	fetcher: TagFetch = fetch,
): Promise<Tag[]> {
	const response = await fetcher(
		`${serverUrl.replace(/\/$/, "")}/articles/${articleId}/tags`,
		{ credentials: "include", cache: "no-store" },
	);

	if (!response.ok) throw new Error("Failed to fetch article tags");

	const result = tagListSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid article tags response");

	return result.data;
}
