import type { Comment } from "../entities/comment.entity";

export type CreateCommentInput = {
	articleId: string;
	authorId: string;
	parentId?: string;
	content: string;
};

export type UpdateCommentInput = {
	content: string;
};

export type CommentRepository = {
	create(input: CreateCommentInput): Promise<Comment>;
	findById(id: string): Promise<Comment | null>;
	findByArticle(articleId: string): Promise<Comment[]>;
	update(id: string, input: UpdateCommentInput): Promise<Comment | null>;
	delete(id: string): Promise<void>;
};
