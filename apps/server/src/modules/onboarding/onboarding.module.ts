import { createOnboardingController } from "./http/onboarding.controller";
import { drizzleOnboardingRepository } from "./infra/repositories/drizzle-onboarding-repository";
import { OnboardingService } from "./onboarding.service";

export const onboardingService = new OnboardingService(
	drizzleOnboardingRepository,
);

export { createOnboardingController };
