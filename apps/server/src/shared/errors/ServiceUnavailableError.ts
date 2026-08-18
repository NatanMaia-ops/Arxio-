import { AppError } from "./AppError";

export class ServiceUnavailableError extends AppError {
	constructor(message = "Servico indisponivel") {
		super(503, "SERVICE_UNAVAILABLE", message);
	}
}
