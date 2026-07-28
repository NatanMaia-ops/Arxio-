import { searchResultListSchema } from "@/features/search/schemas/search.schema";
import type { SearchResult } from "@/features/search/types/search.types";

export const SEARCH_INDEX_PATH = "/api/busca";

export type SearchFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export async function fetchSearchIndex(
	fetcher: SearchFetch = fetch,
): Promise<SearchResult[]> {
	const response = await fetcher(SEARCH_INDEX_PATH, { cache: "no-store" });

	if (!response.ok) throw new Error("Failed to fetch search index");

	const result = searchResultListSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid search index response");

	return result.data;
}
