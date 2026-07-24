import type { Article } from "../entities/article.entity";

export type CreateArticleInput = {
	authorId: string;
	title: string;
	content: string;
};

export type UpdateArticleInput = {
	title?: string;
	content?: string;
};

export type ArticleRepository = {
	create(input: CreateArticleInput): Promise<Article>;
	findById(id: string): Promise<Article | null>;
	findAll(): Promise<Article[]>;
	update(id: string, input: UpdateArticleInput): Promise<Article | null>;
	delete(id: string): Promise<void>;
};
