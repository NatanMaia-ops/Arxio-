import { env } from "@arxio/env/server";
import cors from "cors";
import express, { type Response } from "express";
import { authHandler } from "./auth";
import { type AuthenticatedLocals, auth } from "./middleware";

import { createUsersController } from "./modules/users/http/users.controller";
import { usersService } from "./modules/users/users.module";
import { errorHandler } from "./shared/http/error-handler";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
		credentials: true,
	}),
);

app.use("/auth", authHandler);

app.use(express.json());

app.get(
	"/api/protected",
	auth(),
	(_req, res: Response<unknown, AuthenticatedLocals>) => {
		res.status(200).json(res.locals.session);
	},
);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.use("/users", createUsersController(usersService));

app.use(errorHandler);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
