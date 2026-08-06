import { runMigrations } from "@arxio/db/migrate";
import { env } from "@arxio/env/server";
import cors from "cors";
import express, { type Response } from "express";

import { articlesService } from "./modules/articles/articles.module";
import { createArticlesController } from "./modules/articles/http/articles.controller";
import { authHandler, requireAuth } from "./modules/auth/auth.module";
import type { AuthenticatedLocals } from "./modules/auth/http/auth.middleware";
import {
	createOnboardingController,
	onboardingService,
} from "./modules/onboarding/onboarding.module";
import { createUsersController } from "./modules/users/http/users.controller";
import { usersService } from "./modules/users/users.module";
import { errorHandler } from "./shared/http/error-handler";
import { createWebProxy } from "./shared/http/web-proxy";

const app = express();

app.set("trust proxy", true);

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

app.use("/auth", authHandler);

app.get("/health", (_req, res) => {
	res.status(200).send("OK");
});

app.get(
	"/api/protected",
	requireAuth,
	(_req, res: Response<unknown, AuthenticatedLocals>) => {
		res.status(200).json(res.locals.session);
	},
);

app.use(
	"/users",
	express.json(),
	createUsersController(usersService, requireAuth),
);

app.use(
	"/api/onboarding",
	express.json(),
	createOnboardingController(onboardingService, requireAuth),
);

app.use(
	"/articles",
	express.json(),
	createArticlesController(articlesService, requireAuth),
);

app.use(createWebProxy(env.WEB_INTERNAL_URL));

app.use(errorHandler);

async function start() {
	await runMigrations();

	app.listen(env.PORT, () => {
		console.log(`Server is running on http://localhost:${env.PORT}`);
	});
}

start().catch((error) => {
	console.error("Failed to run migrations", error);
	process.exit(1);
});
