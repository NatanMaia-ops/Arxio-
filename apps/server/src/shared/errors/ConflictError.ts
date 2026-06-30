import { AppError } from "./AppError";

export class ConflictError extends AppError {
	constructor(message = "Recurso") {
		super(409, "CONFLICT", message);
	}
}
