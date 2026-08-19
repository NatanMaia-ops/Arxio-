import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "../../../shared/errors";

import type { ArticleRepository } from "../../articles/repositories/article-repository";
import type { Tag } from "../entities/tag.entity";
import type { TagRepository } from "../repositories/tag-repository";

export class TagService {
	constructor(
		private readonly tags: TagRepository,
		private readonly articles: ArticleRepository,
	) {}

	async createTag(name: string): Promise<Tag> {
		const normalizedName = name.trim();
		const existingTag = await this.tags.findByName(normalizedName);

		if (existingTag) {
			throw new ConflictError("Tag ja cadastrada");
		}

		return this.tags.create({ name: normalizedName });
	}

	async listTags(): Promise<Tag[]> {
		return this.tags.findAll();
	}

	async getArticleTags(articleId: string): Promise<Tag[]> {
		return this.tags.findByArticleId(articleId);
	}

	async setArticleTags(
		articleId: string,
		authorId: string,
		tagIds: string[],
	): Promise<Tag[]> {
		const article = await this.articles.findById(articleId);

		if (!article) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		if (article.authorId !== authorId) {
			throw new ForbiddenError(
				"Voce nao tem permissao para editar este artigo",
			);
		}

		const existingTags = await this.tags.findManyByIds(tagIds);

		if (existingTags.length !== tagIds.length) {
			throw new BadRequestError("Uma ou mais tags nao foram encontradas");
		}

		await this.tags.replaceArticleTags(articleId, tagIds);

		return this.tags.findByArticleId(articleId);
	}
}
