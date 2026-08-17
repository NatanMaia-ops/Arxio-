import { drizzleArticleRepository } from "../articles/infra/repositories/drizzle-article-repository";
import { drizzleLikeRepository } from "./infra/repositories/drizzle-like-repository";
import { LikeService } from "./services/likes.service";

export const likesService = new LikeService(
	drizzleLikeRepository,
	drizzleArticleRepository,
);
