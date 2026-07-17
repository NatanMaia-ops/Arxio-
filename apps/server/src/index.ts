import { env } from "@arxio/env/server";
import cors from "cors";
import express, { type Response } from "express";
import { authHandler } from "./auth";
import { type AuthenticatedLocals, auth } from "./middleware";

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

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
