import { type RequestHandler, type Response, Router } from "express";

import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { OnboardingService } from "../onboarding.service";

import { completeOnboardingSchema } from "./dtos/complete_onboarding.dto";
import { onboardingResponseSchema } from "./dtos/onboarding_response.dto";

export function createOnboardingController(
	onboardingService: OnboardingService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.get(
		"/",
		requireAuth,
		async (_req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const state = await onboardingService.getState(
					res.locals.session.user.id,
				);

				res.status(200).json(onboardingResponseSchema.parse(state));
			} catch (error) {
				next(error);
			}
		},
	);

	router.put(
		"/",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const input = completeOnboardingSchema.parse(req.body);
				const state = await onboardingService.complete(
					res.locals.session.user.id,
					input,
				);

				res.status(200).json(onboardingResponseSchema.parse(state));
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
}
