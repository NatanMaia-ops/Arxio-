import {
	articleListSchema,
	articleSchema,
} from "@/features/articles/schemas/article.schema";
import type {
	Article,
	ArticleInput,
	ArticleListFilters,
} from "@/features/articles/types/article.types";

export type ArticleFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function articlesUrl(serverUrl: string, path = ""): string {
	return `${serverUrl.replace(/\/$/, "")}/articles${path}`;
}

function parseArticle(data: unknown): Article {
	const result = articleSchema.safeParse(data);

	if (!result.success) throw new Error("Invalid article response");

	return result.data;
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

export async function fetchArticles(
	serverUrl: string,
	filters: ArticleListFilters = {},
	fetcher: ArticleFetch = fetch,
): Promise<Article[]> {
	const query = new URLSearchParams();

	if (filters.authorId) query.set("authorId", filters.authorId);

	const queryString = query.toString();
	const url = `${articlesUrl(serverUrl)}${queryString ? `?${queryString}` : ""}`;
	const response = await fetcher(url, {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) throw new Error("Failed to fetch articles");

	const result = articleListSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid articles response");

	return result.data;
}

export async function fetchArticleById(
	serverUrl: string,
	id: string,
	fetcher: ArticleFetch = fetch,
): Promise<Article | null> {
	const response = await fetcher(articlesUrl(serverUrl, `/${id}`), {
		credentials: "include",
		cache: "no-store",
	});

	if (response.status === 400 || response.status === 404) return null;
	if (!response.ok) throw new Error("Failed to fetch article");

	return parseArticle(await response.json());
}

export async function createArticle(
	serverUrl: string,
	input: ArticleInput,
	fetcher: ArticleFetch = fetch,
): Promise<Article> {
	const response = await fetcher(articlesUrl(serverUrl), {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível publicar o artigo"),
		);
	}

	return parseArticle(await response.json());
}

export async function updateArticle(
	serverUrl: string,
	id: string,
	input: Partial<ArticleInput>,
	fetcher: ArticleFetch = fetch,
): Promise<Article> {
	const response = await fetcher(articlesUrl(serverUrl, `/${id}`), {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível salvar o artigo"),
		);
	}

	return parseArticle(await response.json());
}

export async function deleteArticle(
	serverUrl: string,
	id: string,
	fetcher: ArticleFetch = fetch,
): Promise<void> {
	const response = await fetcher(articlesUrl(serverUrl, `/${id}`), {
		method: "DELETE",
		credentials: "include",
	});

	if (response.status === 404) return;

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível excluir o artigo"),
		);
	}
}

export async function confirmArticleCover(
	serverUrl: string,
	id: string,
	objectKey: string,
	fetcher: ArticleFetch = fetch,
): Promise<Article> {
	const response = await fetcher(articlesUrl(serverUrl, `/${id}/cover`), {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ objectKey }),
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível salvar a capa"),
		);
	}

	return parseArticle(await response.json());
}

export async function removeArticleCover(
	serverUrl: string,
	id: string,
	fetcher: ArticleFetch = fetch,
): Promise<Article> {
	const response = await fetcher(articlesUrl(serverUrl, `/${id}/cover`), {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível remover a capa"),
		);
	}

	return parseArticle(await response.json());
}
