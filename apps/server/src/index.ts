import { env } from "@arxio/env/server";
import cors from "cors";
import express from "express";
import { authHandler } from "./auth";

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

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
