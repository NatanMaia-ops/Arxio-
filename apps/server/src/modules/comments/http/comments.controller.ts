import { type RequestHandler, type Response, Router } from "express";
import { z } from "zod";

import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { CommentService } from "../services/comments.service";

import { commentResponseSchema } from "./dtos/comment_response.dto";
import { createCommentSchema } from "./dtos/create_comment.dto";
import { updateCommentSchema } from "./dtos/update_comment.dto";

const articleParamsSchema = z.object({
	articleId: z.uuid("Informe um id de artigo valido"),
});

const paramsWithIdSchema = z.object({
	id: z.uuid("Informe um id de comentario valido"),
});

export function createArticleCommentsController(
	commentsService: CommentService,
	requireAuth: RequestHandler,
) {
	const router = Router({ mergeParams: true });

	router.post(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { articleId } = articleParamsSchema.parse(req.params);
				const input = createCommentSchema.parse(req.body);
				const comment = await commentsService.createComment({
					...input,
					articleId,
					authorId: res.locals.session.user.id,
				});

				res.status(201).json(commentResponseSchema.parse(comment));
			} catch (error) {
				next(error);
			}
		},
	);

	router.get("/", async (req, res, next) => {
		try {
			const { articleId } = articleParamsSchema.parse(req.params);
			const comments = await commentsService.listCommentsByArticle(articleId);

			res
				.status(200)
				.json(comments.map((comment) => commentResponseSchema.parse(comment)));
		} catch (error) {
			next(error);
		}
	});

	return router;
}

export function createCommentsController(
	commentsService: CommentService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.patch(
		"/:id",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { id } = paramsWithIdSchema.parse(req.params);
				const input = updateCommentSchema.parse(req.body);
				const updated = await commentsService.updateComment(
					id,
					res.locals.session.user.id,
					input,
				);

				res.status(200).json(commentResponseSchema.parse(updated));
			} catch (error) {
				next(error);
			}
		},
	);

	router.delete(
		"/:id",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { id } = paramsWithIdSchema.parse(req.params);

				await commentsService.deleteComment(id, res.locals.session.user.id);

				res.status(204).end();
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
}
