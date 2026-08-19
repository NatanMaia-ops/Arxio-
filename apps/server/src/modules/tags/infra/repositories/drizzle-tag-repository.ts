import { db } from "@arxio/db";
import { articleTags } from "@arxio/db/schema/article-tag";
import { tags } from "@arxio/db/schema/tag";
import { eq, inArray } from "drizzle-orm";

import type { Tag } from "../../entities/tag.entity";
import type {
	CreateTagInput,
	TagRepository,
} from "../../repositories/tag-repository";

function toTag(row: typeof tags.$inferSelect): Tag {
	return {
		id: row.id,
		name: row.name,
		createdAt: row.createdAt,
	};
}

export const drizzleTagRepository: TagRepository = {
	async create(input: CreateTagInput) {
		const [tag] = await db
			.insert(tags)
			.values({
				name: input.name,
			})
			.returning();

		if (!tag) {
			throw new Error("Failed to create tag");
		}

		return toTag(tag);
	},

	async findById(id: string) {
		const [tag] = await db.select().from(tags).where(eq(tags.id, id));

		return tag ? toTag(tag) : null;
	},

	async findByName(name: string) {
		const [tag] = await db.select().from(tags).where(eq(tags.name, name));

		return tag ? toTag(tag) : null;
	},

	async findAll() {
		const rows = await db.select().from(tags);

		return rows.map(toTag);
	},

	async findManyByIds(ids: string[]) {
		if (ids.length === 0) {
			return [];
		}

		const rows = await db.select().from(tags).where(inArray(tags.id, ids));

		return rows.map(toTag);
	},

	async findByArticleId(articleId: string) {
		const rows = await db
			.select({
				id: tags.id,
				name: tags.name,
				createdAt: tags.createdAt,
			})
			.from(tags)
			.innerJoin(articleTags, eq(tags.id, articleTags.tagId))
			.where(eq(articleTags.articleId, articleId));

		return rows.map(toTag);
	},

	async replaceArticleTags(articleId: string, tagIds: string[]) {
		await db.transaction(async (transaction) => {
			await transaction
				.delete(articleTags)
				.where(eq(articleTags.articleId, articleId));

			if (tagIds.length === 0) {
				return;
			}

			await transaction.insert(articleTags).values(
				tagIds.map((tagId) => ({
					articleId,
					tagId,
				})),
			);
		});
	},
};
