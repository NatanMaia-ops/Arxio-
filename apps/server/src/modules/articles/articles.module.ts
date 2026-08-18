import { mediaService } from "../media/media.module";
import { drizzleArticleRepository } from "./infra/repositories/drizzle-article-repository";
import { ArticleService } from "./services/articles.service";

export const articlesService = new ArticleService(
	drizzleArticleRepository,
	mediaService,
);
