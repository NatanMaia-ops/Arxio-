import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
	constructor(message = "Acesso negado!") {
		super(403, "FORBIDDEN", message);
	}
}
