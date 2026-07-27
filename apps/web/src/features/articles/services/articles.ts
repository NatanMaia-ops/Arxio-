import { env } from "@arxio/env/web";

import type {
	Article,
	ArticleInput,
	AuthorSummary,
} from "@/features/articles/types/article.types";

import * as articlesApi from "./articles-api";
import { fetchAuthorSummary } from "./authors-api";

export function getArticles(): Promise<Article[]> {
	return articlesApi.fetchArticles(env.NEXT_PUBLIC_SERVER_URL);
}

export function getArticleById(id: string): Promise<Article | null> {
	return articlesApi.fetchArticleById(env.NEXT_PUBLIC_SERVER_URL, id);
}

export function createArticle(input: ArticleInput): Promise<Article> {
	return articlesApi.createArticle(env.NEXT_PUBLIC_SERVER_URL, input);
}

export function updateArticle(
	id: string,
	input: Partial<ArticleInput>,
): Promise<Article> {
	return articlesApi.updateArticle(env.NEXT_PUBLIC_SERVER_URL, id, input);
}

export function deleteArticle(id: string): Promise<void> {
	return articlesApi.deleteArticle(env.NEXT_PUBLIC_SERVER_URL, id);
}

export function getAuthorSummary(id: string): Promise<AuthorSummary | null> {
	return fetchAuthorSummary(env.NEXT_PUBLIC_SERVER_URL, id);
}
