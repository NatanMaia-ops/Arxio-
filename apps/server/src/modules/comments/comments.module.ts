import { drizzleArticleRepository } from "../articles/infra/repositories/drizzle-article-repository";
import { drizzleCommentRepository } from "./infra/repositories/drizzle-comment-repository";
import { CommentService } from "./services/comments.service";

export const commentsService = new CommentService(
	drizzleCommentRepository,
	drizzleArticleRepository,
);
