import type { SearchResult } from "@/features/search/types/search.types";

export const SEARCH_RESULT_LIMIT = 8;

export function normalizeTerm(value: string): string {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

export function filterSearchResults(
	results: SearchResult[],
	query: string,
	limit: number = SEARCH_RESULT_LIMIT,
): SearchResult[] {
	const terms = normalizeTerm(query).split(/\s+/).filter(Boolean);

	if (terms.length === 0) return results.slice(0, limit);

	return results
		.filter((result) => {
			const haystack = normalizeTerm(`${result.title} ${result.authorName}`);

			return terms.every((term) => haystack.includes(term));
		})
		.slice(0, limit);
}
