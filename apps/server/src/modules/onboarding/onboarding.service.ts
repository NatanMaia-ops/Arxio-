import { ConflictError, NotFoundError } from "../../shared/errors";

import type { OnboardingState } from "./entities/onboarding.entity";
import type {
	CompleteOnboardingInput,
	OnboardingRepository,
} from "./repositories/onboarding-repository";

export class OnboardingService {
	constructor(private readonly onboarding: OnboardingRepository) {}

	async getState(userId: string): Promise<OnboardingState> {
		const state = await this.onboarding.findByUserId(userId);

		if (!state) {
			throw new NotFoundError("Usuario nao encontrado");
		}

		return state;
	}

	async complete(
		userId: string,
		input: CompleteOnboardingInput,
	): Promise<OnboardingState> {
		const result = await this.onboarding.complete(userId, input);

		if (result.status === "user-not-found") {
			throw new NotFoundError("Usuario nao encontrado");
		}

		if (result.status === "already-completed") {
			throw new ConflictError("Onboarding ja concluido");
		}

		return result.state;
	}
}
