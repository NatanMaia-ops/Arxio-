import { authorSummarySchema } from "@/features/articles/schemas/article.schema";
import type { AuthorSummary } from "@/features/articles/types/article.types";

import type { ArticleFetch } from "./articles-api";

export async function fetchAuthorSummary(
	serverUrl: string,
	id: string,
	fetcher: ArticleFetch = fetch,
): Promise<AuthorSummary | null> {
	const response = await fetcher(
		`${serverUrl.replace(/\/$/, "")}/users/${id}`,
		{ credentials: "include", cache: "no-store" },
	);

	if (response.status === 400 || response.status === 404) return null;
	if (!response.ok) throw new Error("Failed to fetch author");

	const result = authorSummarySchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid author response");

	return result.data;
}
