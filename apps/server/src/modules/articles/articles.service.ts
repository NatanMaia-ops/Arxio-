import type { Article } from "../articles/entities/article.entity.ts";
import {
	type ArticleRepository,
	type CreateArticleInput,
	type UpdateArticleInput,
} from "./repositories/article-repository";

export class ArticleService {
	constructor(private readonly articles: ArticleRepository) {}

	async createArticle(input: CreateArticleInput): Promise<Article> {
		return this.articles.create(input);
	}

	async getArticleById(id: string): Promise<Article | null> {
		return this.articles.findById(id);
	}

	async listArticles(): Promise<Article[]> {
		return this.articles.findAll();
	}

	async updateArticle(
		id: string,
		input: UpdateArticleInput,
	): Promise<Article | null> {
		return this.articles.update(id, input);
	}

	async deleteArticle(id: string): Promise<void> {
		return this.articles.delete(id);
	}
}
