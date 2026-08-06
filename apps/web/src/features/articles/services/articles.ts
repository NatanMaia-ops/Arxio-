import { env } from "@arxio/env/web";

import type {
	Article,
	ArticleInput,
	ArticleListFilters,
	AuthorSummary,
} from "@/features/articles/types/article.types";

import * as articlesApi from "./articles-api";
import { fetchAuthorSummary } from "./authors-api";

function apiUrl(): string {
	if (typeof window === "undefined") {
		return process.env.SERVER_INTERNAL_URL || env.NEXT_PUBLIC_SERVER_URL;
	}

	return env.NEXT_PUBLIC_SERVER_URL;
}

export function getArticles(
	filters: ArticleListFilters = {},
): Promise<Article[]> {
	return articlesApi.fetchArticles(apiUrl(), filters);
}

export function getArticleById(id: string): Promise<Article | null> {
	return articlesApi.fetchArticleById(apiUrl(), id);
}

export function createArticle(input: ArticleInput): Promise<Article> {
	return articlesApi.createArticle(apiUrl(), input);
}

export function updateArticle(
	id: string,
	input: Partial<ArticleInput>,
): Promise<Article> {
	return articlesApi.updateArticle(apiUrl(), id, input);
}

export function deleteArticle(id: string): Promise<void> {
	return articlesApi.deleteArticle(apiUrl(), id);
}

export function getAuthorSummary(id: string): Promise<AuthorSummary | null> {
	return fetchAuthorSummary(apiUrl(), id);
}
