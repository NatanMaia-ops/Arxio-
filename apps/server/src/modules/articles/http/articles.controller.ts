import { type Response, Router } from "express";
import { z } from "zod";

import { ForbiddenError, NotFoundError } from "../../../shared/errors";
import { type AuthenticatedLocals, auth } from "../../../middleware";
import type { SessionReader } from "../../auth/auth.service";
import type { ArticleService } from "../services/articles.service";

import { articleResponseSchema } from "./dtos/article_response.dto";
import { createArticleSchema } from "./dtos/create_article.dto";
import { updateArticleSchema } from "./dtos/update_article.dto";

const paramsWithIdSchema = z.object({
	id: z.uuid("Informe um id de artigo valido"),
});

export function createArticlesController(
	articlesService: ArticleService,
	readSession?: SessionReader,
) {
	const protect = readSession ? auth(readSession) : auth();
	const router = Router();

	router.post(
		"/",
		protect,
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

	router.get("/", async (_req, res, next) => {
		try {
			const articles = await articlesService.listArticles();

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
		protect,
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

				res.status(200).json(articleResponseSchema.parse(updated));
			} catch (error) {
				next(error);
			}
		},
	);

	router.delete(
		"/:id",
		protect,
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
