import { AppError } from "./AppError";

export class NotFoundError extends AppError {
	constructor(message = "Recurso nao encontrado") {
		super(404, "NOT_FOUND", message);
	}
}
