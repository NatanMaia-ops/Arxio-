import { AppError } from "./AppError";

export class BadRequestError extends AppError {
	constructor(message = "Requisicao invalida") {
		super(400, "BAD_REQUEST", message);
	}
}
