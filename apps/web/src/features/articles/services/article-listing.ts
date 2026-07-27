import type {
	Article,
	AuthorSummary,
} from "@/features/articles/types/article.types";

import { getArticles, getAuthorSummary } from "./articles";

export const UNKNOWN_AUTHOR_NAME = "Autor desconhecido";

export type ArticleWithAuthor = {
	article: Article;
	authorName: string;
};

export async function resolveAuthorName(authorId: string): Promise<string> {
	try {
		const author = await getAuthorSummary(authorId);

		return author?.name ?? UNKNOWN_AUTHOR_NAME;
	} catch {
		return UNKNOWN_AUTHOR_NAME;
	}
}

export function sortByNewest(articles: Article[]): Article[] {
	return [...articles].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);
}

export async function listArticlesWithAuthors(): Promise<ArticleWithAuthor[]> {
	const articles = sortByNewest(await getArticles());
	const authorIds = [...new Set(articles.map((article) => article.authorId))];
	const names = new Map<string, string>();

	await Promise.all(
		authorIds.map(async (authorId) => {
			names.set(authorId, await resolveAuthorName(authorId));
		}),
	);

	return articles.map((article) => ({
		article,
		authorName: names.get(article.authorId) ?? UNKNOWN_AUTHOR_NAME,
	}));
}

export type { AuthorSummary };
