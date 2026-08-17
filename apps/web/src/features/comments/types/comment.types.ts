export type Comment = {
	id: string;
	articleId: string;
	authorId: string;
	parentId: string | null;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};

export type CommentInput = {
	content: string;
	parentId?: string;
};
