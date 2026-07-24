import { env } from "@arxio/env/server";
import cors from "cors";
import express, { type Response } from "express";

import { articlesService } from "./modules/articles/articles.module";
import { createArticlesController } from "./modules/articles/http/articles.controller";
import { authHandler, requireAuth } from "./modules/auth/auth.module";
import type { AuthenticatedLocals } from "./modules/auth/http/auth.middleware";
import { createUsersController } from "./modules/users/http/users.controller";
import { usersService } from "./modules/users/users.module";
import { errorHandler } from "./shared/http/error-handler";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

app.use("/auth", authHandler);

app.use(express.json());

app.get(
	"/api/protected",
	requireAuth,
	(_req, res: Response<unknown, AuthenticatedLocals>) => {
		res.status(200).json(res.locals.session);
	},
);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.use("/users", createUsersController(usersService));

app.use("/articles", createArticlesController(articlesService, requireAuth));

app.use(errorHandler);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
