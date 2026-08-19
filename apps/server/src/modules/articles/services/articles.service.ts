import { ForbiddenError, NotFoundError } from "../../../shared/errors";
import type { MediaService } from "../../media/media.service";
import type { Article } from "../entities/article.entity";
import type {
	ArticleRepository,
	CreateArticleInput,
	ListArticlesFilters,
	UpdateArticleInput,
} from "../repositories/article-repository";

type CreateArticleServiceInput = Omit<CreateArticleInput, "status"> & {
	status?: CreateArticleInput["status"];
};

export class ArticleService {
	constructor(
		private readonly articles: ArticleRepository,
		private readonly media?: MediaService,
	) {}

	async createArticle(input: CreateArticleServiceInput): Promise<Article> {
		return this.withResolvedCover(
			await this.articles.create({
				...input,
				status: input.status ?? "draft",
			}),
		);
	}

	async getArticleById(id: string): Promise<Article | null> {
		const article = await this.articles.findById(id);
		return article ? this.withResolvedCover(article) : null;
	}

	async listArticles(filters: ListArticlesFilters = {}): Promise<Article[]> {
		const articles = await this.articles.findAll(filters);
		return articles.map((article) => this.withResolvedCover(article));
	}

	async updateArticle(
		id: string,
		input: UpdateArticleInput,
	): Promise<Article | null> {
		const article = await this.articles.update(id, input);
		return article ? this.withResolvedCover(article) : null;
	}

	async publishArticle(id: string, authorId: string): Promise<Article> {
		await this.requireOwnedArticle(id, authorId);
		const article = await this.articles.update(id, { status: "published" });

		if (!article) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		return this.withResolvedCover(article);
	}

	async setCover(
		id: string,
		authenticatedUserId: string,
		pendingObjectKey: string,
	): Promise<Article> {
		const media = this.requireMedia();
		const current = await this.requireOwnedArticle(id, authenticatedUserId);
		const objectKey = await media.promotePendingUpload({
			userId: authenticatedUserId,
			purpose: "article-cover",
			pendingObjectKey,
			destinationOwnerId: current.id,
		});

		try {
			const result = await this.articles.replaceCoverObjectKey(id, objectKey);

			if (!result) {
				throw new NotFoundError("Artigo nao encontrado");
			}

			await media.deleteBestEffort(result.previousObjectKey);
			return this.withResolvedCover(result.article);
		} catch (error) {
			await media.deleteBestEffort(objectKey);
			throw error;
		}
	}

	async removeCover(id: string, authenticatedUserId: string): Promise<Article> {
		await this.requireOwnedArticle(id, authenticatedUserId);
		const result = await this.articles.replaceCoverObjectKey(id, null);

		if (!result) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		await this.media?.deleteBestEffort(result.previousObjectKey);
		return this.withResolvedCover(result.article);
	}

	async deleteArticle(id: string): Promise<void> {
		const article = await this.articles.findById(id);
		await this.articles.delete(id);
		await this.media?.deleteBestEffort(article?.coverObjectKey ?? null);
	}

	private async requireOwnedArticle(
		id: string,
		authenticatedUserId: string,
	): Promise<Article> {
		const article = await this.articles.findById(id);

		if (!article) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		if (article.authorId !== authenticatedUserId) {
			throw new ForbiddenError(
				"Voce nao tem permissao para editar este artigo",
			);
		}

		return article;
	}

	private withResolvedCover(article: Article): Article {
		return {
			...article,
			coverUrl: article.coverObjectKey
				? this.requireMedia().publicUrl(article.coverObjectKey)
				: null,
		};
	}

	private requireMedia(): MediaService {
		if (!this.media) {
			throw new Error("MediaService is required for article cover operations");
		}

		return this.media;
	}
}
