import { ConflictError, NotFoundError } from "../../../shared/errors";

import type { ArticleRepository } from "../../articles/repositories/article-repository";
import type { Like } from "../entities/like.entity";
import type { LikeRepository } from "../repositories/like-repository";

export class LikeService {
	constructor(
		private readonly likes: LikeRepository,
		private readonly articles: ArticleRepository,
	) {}

	async likeArticle(articleId: string, userId: string): Promise<Like> {
		const article = await this.articles.findById(articleId);

		if (!article) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		const existingLike = await this.likes.findByArticleAndUser(
			articleId,
			userId,
		);

		if (existingLike) {
			throw new ConflictError("Artigo ja curtido");
		}

		return this.likes.create({ articleId, userId });
	}

	async unlikeArticle(articleId: string, userId: string): Promise<void> {
		const like = await this.likes.findByArticleAndUser(articleId, userId);

		if (!like) {
			throw new NotFoundError("Curtida nao encontrada");
		}

		await this.likes.delete(articleId, userId);
	}

	async getLikesCount(articleId: string): Promise<number> {
		return this.likes.countByArticle(articleId);
	}

	async hasUserLiked(articleId: string, userId: string): Promise<boolean> {
		const like = await this.likes.findByArticleAndUser(articleId, userId);
		return like !== null;
	}
}
