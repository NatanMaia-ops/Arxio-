import type {
	Article,
	ArticleListFilters,
	AuthorSummary,
} from "@/features/articles/types/article.types";
import { getComments } from "@/features/comments/services/comments";
import { getLikesStatus } from "@/features/likes/services/likes";

import { getArticles, getAuthorSummary } from "./articles";

export const UNKNOWN_AUTHOR_NAME = "Autor desconhecido";

export const EMPTY_ENGAGEMENT: ArticleEngagement = { likes: 0, comments: 0 };

export type ArticleEngagement = {
	likes: number;
	comments: number;
};

export type ArticleWithAuthor = {
	article: Article;
	author: AuthorSummary;
	engagement: ArticleEngagement;
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

export async function resolveEngagement(
	articleId: string,
): Promise<ArticleEngagement> {
	const [likes, comments] = await Promise.all([
		getLikesStatus(articleId)
			.then((status) => status.count)
			.catch(() => 0),
		getComments(articleId)
			.then((list) => list.length)
			.catch(() => 0),
	]);

	return { likes, comments };
}

export async function listEngagement(
	articleIds: string[],
): Promise<Map<string, ArticleEngagement>> {
	const entries = await Promise.all(
		articleIds.map(
			async (articleId) =>
				[articleId, await resolveEngagement(articleId)] as const,
		),
	);

	return new Map(entries);
}

export async function listArticlesWithAuthors(
	filters: ArticleListFilters = {},
): Promise<ArticleWithAuthor[]> {
	const articles = sortByNewest(await getArticles(filters));
	const authorIds = [...new Set(articles.map((article) => article.authorId))];
	const authors = new Map<string, AuthorSummary>();

	const [engagement] = await Promise.all([
		listEngagement(articles.map((article) => article.id)),
		Promise.all(
			authorIds.map(async (authorId) => {
				authors.set(authorId, await resolveAuthor(authorId));
			}),
		),
	]);

	return articles.map((article) => ({
		article,
		author: authors.get(article.authorId) ?? {
			id: article.authorId,
			name: UNKNOWN_AUTHOR_NAME,
			avatarUrl: null,
		},
		engagement: engagement.get(article.id) ?? EMPTY_ENGAGEMENT,
	}));
}

export type { AuthorSummary };
