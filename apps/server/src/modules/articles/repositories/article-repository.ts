import type { Article } from "../entities/article.entity";

export type CreateArticleInput = {
	authorId: string;
	title: string;
	content: string;
	coverFit: "cover" | "contain";
};

export type UpdateArticleInput = {
	title?: string;
	content?: string;
	coverFit?: "cover" | "contain";
};

export type ListArticlesFilters = {
	authorId?: string;
};

export type ArticleRepository = {
	create(input: CreateArticleInput): Promise<Article>;
	findById(id: string): Promise<Article | null>;
	findAll(filters?: ListArticlesFilters): Promise<Article[]>;
	update(id: string, input: UpdateArticleInput): Promise<Article | null>;
	replaceCoverObjectKey(
		id: string,
		objectKey: string | null,
	): Promise<{
		article: Article;
		previousObjectKey: string | null;
	} | null>;
	delete(id: string): Promise<void>;
};
