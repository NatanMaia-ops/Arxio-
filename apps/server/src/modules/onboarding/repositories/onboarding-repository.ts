import type { OnboardingState } from "../entities/onboarding.entity";

export type CompleteOnboardingInput = {
	name: string;
	course: string | null;
	semester: number | null;
	institution: string | null;
};

export type CompleteOnboardingResult =
	| {
			status: "completed" | "already-completed";
			state: OnboardingState;
	  }
	| {
			status: "user-not-found";
	  };

export type OnboardingRepository = {
	findByUserId(userId: string): Promise<OnboardingState | null>;
	complete(
		userId: string,
		input: CompleteOnboardingInput,
	): Promise<CompleteOnboardingResult>;
};
