import { ForbiddenError, NotFoundError } from "../../../shared/errors";

import type { ArticleRepository } from "../../articles/repositories/article-repository";
import type { Comment } from "../entities/comment.entity";
import type {
	CommentRepository,
	CreateCommentInput,
	UpdateCommentInput,
} from "../repositories/comment-repository";

export class CommentService {
	constructor(
		private readonly comments: CommentRepository,
		private readonly articles: ArticleRepository,
	) {}

	async createComment(input: CreateCommentInput): Promise<Comment> {
		const article = await this.articles.findById(input.articleId);

		if (!article) {
			throw new NotFoundError("Artigo nao encontrado");
		}

		if (input.parentId) {
			const parent = await this.comments.findById(input.parentId);

			if (!parent || parent.articleId !== input.articleId) {
				throw new NotFoundError("Comentario pai nao encontrado");
			}
		}

		return this.comments.create(input);
	}

	async listCommentsByArticle(articleId: string): Promise<Comment[]> {
		const comments = await this.comments.findByArticle(articleId);

		return [...comments].sort(
			(first, second) => first.createdAt.getTime() - second.createdAt.getTime(),
		);
	}

	async updateComment(
		id: string,
		authorId: string,
		input: UpdateCommentInput,
	): Promise<Comment> {
		const comment = await this.getOwnedComment(id, authorId);
		const updatedComment = await this.comments.update(comment.id, input);

		if (!updatedComment) {
			throw new NotFoundError("Comentario nao encontrado");
		}

		return updatedComment;
	}

	async deleteComment(id: string, authorId: string): Promise<void> {
		const comment = await this.getOwnedComment(id, authorId);
		await this.comments.delete(comment.id);
	}

	private async getOwnedComment(
		id: string,
		authorId: string,
	): Promise<Comment> {
		const comment = await this.comments.findById(id);

		if (!comment) {
			throw new NotFoundError("Comentario nao encontrado");
		}

		if (comment.authorId !== authorId) {
			throw new ForbiddenError("Sem permissao para alterar este comentario");
		}

		return comment;
	}
}
