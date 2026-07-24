import { ArticleService } from "./services/articles.service";
import { drizzleArticleRepository } from "./infra/repositories/drizzle-article-repository";

export const articlesService = new ArticleService(drizzleArticleRepository);
