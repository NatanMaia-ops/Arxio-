import { type RequestHandler, type Response, Router } from "express";
import { z } from "zod";

import { ForbiddenError, NotFoundError } from "../../../shared/errors";
import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { ArticleService } from "../services/articles.service";

import { articleResponseSchema } from "./dtos/article_response.dto";
import { createArticleSchema } from "./dtos/create_article.dto";
import { listArticlesQuerySchema } from "./dtos/list_articles_query.dto";
import { updateArticleSchema } from "./dtos/update_article.dto";

const paramsWithIdSchema = z.object({
	id: z.uuid("Informe um id de artigo valido"),
});

export function createArticlesController(
	articlesService: ArticleService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.post(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const input = createArticleSchema.parse(req.body);
				const article = await articlesService.createArticle({
					...input,
					authorId: res.locals.session.user.id,
				});

				res.status(201).json(articleResponseSchema.parse(article));
			} catch (error) {
				next(error);
			}
		},
	);

	router.get("/", async (req, res, next) => {
		try {
			const filters = listArticlesQuerySchema.parse(req.query);
			const articles = await articlesService.listArticles(filters);

			res.status(200).json(articles.map((a) => articleResponseSchema.parse(a)));
		} catch (error) {
			next(error);
		}
	});

	router.get("/:id", async (req, res, next) => {
		try {
			const { id } = paramsWithIdSchema.parse(req.params);
			const article = await articlesService.getArticleById(id);

			if (!article) {
				throw new NotFoundError("Artigo nao encontrado");
			}

			res.status(200).json(articleResponseSchema.parse(article));
		} catch (error) {
			next(error);
		}
	});

	router.patch(
		"/:id",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const { id } = paramsWithIdSchema.parse(req.params);
				const input = updateArticleSchema.parse(req.body);
				const article = await articlesService.getArticleById(id);

				if (!article) {
					throw new NotFoundError("Artigo nao encontrado");
				}

				if (article.authorId !== res.locals.session.user.id) {
					throw new ForbiddenError(
						"Voce nao tem permissao para editar este artigo",
					);
				}

				const updated = await articlesService.updateArticle(id, input);

				if (!updated) {
					throw new NotFoundError("Artigo nao encontrado");
				}

				res.status(200).json(articleResponseSchema.parse(updated));
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
				const article = await articlesService.getArticleById(id);

				if (!article) {
					throw new NotFoundError("Artigo nao encontrado");
				}

				if (article.authorId !== res.locals.session.user.id) {
					throw new ForbiddenError(
						"Voce nao tem permissao para deletar este artigo",
					);
				}

				await articlesService.deleteArticle(id);

				res.status(204).end();
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
}
