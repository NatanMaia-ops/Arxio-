import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
	if (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		error.type === "entity.too.large"
	) {
		res.status(413).json({
			code: "PAYLOAD_TOO_LARGE",
			message: "O corpo da requisição excede o limite permitido",
		});
		return;
	}

	if (error instanceof ZodError) {
		res.status(400).json({
			code: "VALIDATION_ERROR",
			message: "Dados invalidos",
			issues: error.issues,
		});
		return;
	}

	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			code: error.code,
			message: error.message,
		});
		return;
	}

	res.status(500).json({
		code: "INTERNAL_SERVER_ERROR",
		message: "Erro interno do servidor",
	});
};
