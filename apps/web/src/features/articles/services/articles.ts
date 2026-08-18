import type {
	Article,
	ArticleInput,
	ArticleListFilters,
	AuthorSummary,
} from "@/features/articles/types/article.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import * as articlesApi from "./articles-api";
import { fetchAuthorSummary } from "./authors-api";

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

export function saveArticleCover(
	id: string,
	objectKey: string,
): Promise<Article> {
	return articlesApi.confirmArticleCover(apiUrl(), id, objectKey);
}

export function deleteArticleCover(id: string): Promise<Article> {
	return articlesApi.removeArticleCover(apiUrl(), id);
}

export function getAuthorSummary(id: string): Promise<AuthorSummary | null> {
	return fetchAuthorSummary(apiUrl(), id);
}
