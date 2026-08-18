export type Article = {
	id: string;
	authorId: string;
	title: string;
	content: string;
	coverUrl: string | null;
	coverFit: CoverFit;
	createdAt: Date;
	updatedAt: Date;
};

export type ArticleInput = {
	title: string;
	content: string;
	coverFit: CoverFit;
};

export type CoverFit = "cover" | "contain";

export type ArticleListFilters = {
	authorId?: string;
};

export type AuthorSummary = {
	id: string;
	name: string;
	avatarUrl: string | null;
};
