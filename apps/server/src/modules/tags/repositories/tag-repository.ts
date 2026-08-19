import type { Tag } from "../entities/tag.entity";

export type CreateTagInput = {
	name: string;
};

export type TagRepository = {
	create(input: CreateTagInput): Promise<Tag>;
	findById(id: string): Promise<Tag | null>;
	findByName(name: string): Promise<Tag | null>;
	findAll(): Promise<Tag[]>;
	findManyByIds(ids: string[]): Promise<Tag[]>;
	findByArticleId(articleId: string): Promise<Tag[]>;
	replaceArticleTags(articleId: string, tagIds: string[]): Promise<void>;
};
