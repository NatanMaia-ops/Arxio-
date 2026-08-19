import { drizzleArticleRepository } from "../articles/infra/repositories/drizzle-article-repository";
import { drizzleTagRepository } from "./infra/repositories/drizzle-tag-repository";
import { TagService } from "./services/tags.service";

export const tagsService = new TagService(
	drizzleTagRepository,
	drizzleArticleRepository,
);
