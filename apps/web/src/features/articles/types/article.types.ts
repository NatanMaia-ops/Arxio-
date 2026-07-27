export type Article = {
	id: string;
	authorId: string;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};

export type ArticleInput = {
	title: string;
	content: string;
};

export type AuthorSummary = {
	id: string;
	name: string;
	avatarUrl: string | null;
};
