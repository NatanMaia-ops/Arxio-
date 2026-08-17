import type { Like } from "../entities/like.entity";

export type CreateLikeInput = {
	articleId: string;
	userId: string;
};

export type LikeRepository = {
	create(input: CreateLikeInput): Promise<Like>;
	findByArticleAndUser(articleId: string, userId: string): Promise<Like | null>;
	countByArticle(articleId: string): Promise<number>;
	delete(articleId: string, userId: string): Promise<void>;
};
