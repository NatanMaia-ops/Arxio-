import { type RequestHandler, type Response, Router } from "express";
import { z } from "zod";

import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { TagService } from "../services/tags.service";

import { createTagSchema } from "./dtos/create_tag.dto";
import { setArticleTagsSchema } from "./dtos/set_article_tags.dto";
import { tagResponseSchema } from "./dtos/tag_response.dto";

const articleParamsSchema = z.object({
	articleId: z.uuid("Informe um id de artigo valido"),
});

export function createTagsController(
	tagsService: TagService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.post("/", requireAuth, async (req, res, next) => {
		try {
			const input = createTagSchema.parse(req.body);
			const tag = await tagsService.createTag(input.name);

			res.status(201).json(tagResponseSchema.parse(tag));
		} catch (error) {
			next(error);
		}
	});

	router.get("/", async (_req, res, next) => {
		try {
			const tags = await tagsService.listTags();

			res.status(200).json(tags.map((tag) => tagResponseSchema.parse(tag)));
		} catch (error) {
			next(error);
		}
	});

	return router;
}

export function createArticleTagsController(
	tagsService: TagService,
	requireAuth: RequestHandler,
) {
	const router = Router({ mergeParams: true });

	router.get("/", async (req, res, next) => {
		try {
			const { articleId } = articleParamsSchema.parse(req.params);
			const tags = await tagsService.getArticleTags(articleId);

			res.status(200).json(tags.map((tag) => tagResponseSchema.parse(tag)));
		} catch (error) {
			next(error);
		}
	});

	router.put(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { articleId } = articleParamsSchema.parse(req.params);
				const input = setArticleTagsSchema.parse(req.body);
				const tags = await tagsService.setArticleTags(
					articleId,
					res.locals.session.user.id,
					input.tagIds,
				);

				res.status(200).json(tags.map((tag) => tagResponseSchema.parse(tag)));
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
}
