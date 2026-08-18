import type {
	Article,
	AuthorSummary,
} from "@/features/articles/types/article.types";

import { getArticles, getAuthorSummary } from "./articles";

export const UNKNOWN_AUTHOR_NAME = "Autor desconhecido";

export type ArticleWithAuthor = {
	article: Article;
	author: AuthorSummary;
};

export async function resolveAuthor(authorId: string): Promise<AuthorSummary> {
	try {
		const author = await getAuthorSummary(authorId);

		return (
			author ?? { id: authorId, name: UNKNOWN_AUTHOR_NAME, avatarUrl: null }
		);
	} catch {
		return { id: authorId, name: UNKNOWN_AUTHOR_NAME, avatarUrl: null };
	}
}

export async function resolveAuthorName(authorId: string): Promise<string> {
	return (await resolveAuthor(authorId)).name;
}

export function sortByNewest(articles: Article[]): Article[] {
	return [...articles].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);
}

export async function listArticlesWithAuthors(): Promise<ArticleWithAuthor[]> {
	const articles = sortByNewest(await getArticles());
	const authorIds = [...new Set(articles.map((article) => article.authorId))];
	const authors = new Map<string, AuthorSummary>();

	await Promise.all(
		authorIds.map(async (authorId) => {
			authors.set(authorId, await resolveAuthor(authorId));
		}),
	);

	return articles.map((article) => ({
		article,
		author: authors.get(article.authorId) ?? {
			id: article.authorId,
			name: UNKNOWN_AUTHOR_NAME,
			avatarUrl: null,
		},
	}));
}

export type { AuthorSummary };
