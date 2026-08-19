export type Article = {
	id: string;
	authorId: string;
	title: string;
	content: string;
	status: "draft" | "published";
	coverObjectKey: string | null;
	coverUrl: string | null;
	coverFit: "cover" | "contain";
	createdAt: Date;
	updatedAt: Date;
};
