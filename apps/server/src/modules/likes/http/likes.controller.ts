import { type RequestHandler, type Response, Router } from "express";
import { z } from "zod";

import type {
	AuthenticatedLocals,
	SessionReader,
} from "../../auth/http/auth.middleware";
import type { LikeService } from "../services/likes.service";

import { likeResponseSchema } from "./dtos/like_response.dto";
import { likesStatusResponseSchema } from "./dtos/likes_status_response.dto";

const paramsSchema = z.object({
	articleId: z.uuid("Informe um id de artigo valido"),
});

export function createLikesController(
	likesService: LikeService,
	requireAuth: RequestHandler,
	readSession: SessionReader,
) {
	const router = Router({ mergeParams: true });

	router.post(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { articleId } = paramsSchema.parse(req.params);
				const like = await likesService.likeArticle(
					articleId,
					res.locals.session.user.id,
				);

				res.status(201).json(likeResponseSchema.parse(like));
			} catch (error) {
				next(error);
			}
		},
	);

	router.delete(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { articleId } = paramsSchema.parse(req.params);

				await likesService.unlikeArticle(articleId, res.locals.session.user.id);

				res.status(204).end();
			} catch (error) {
				next(error);
			}
		},
	);

	router.get("/", async (req, res, next) => {
		try {
			const { articleId } = paramsSchema.parse(req.params);
			const session = await readSession(req);
			const userId =
				typeof session?.user?.id === "string" ? session.user.id : undefined;

			const [count, likedByMe] = await Promise.all([
				likesService.getLikesCount(articleId),
				userId ? likesService.hasUserLiked(articleId, userId) : false,
			]);

			res
				.status(200)
				.json(likesStatusResponseSchema.parse({ count, likedByMe }));
		} catch (error) {
			next(error);
		}
	});

	return router;
}
