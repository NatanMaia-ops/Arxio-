import { z } from "zod";

export const onboardingResponseSchema = z.object({
	completed: z.boolean(),
	user: z.object({
		name: z.string(),
		email: z.email(),
	}),
	studentProfile: z
		.object({
			course: z.string().nullable(),
			semester: z.number().int().nullable(),
			institution: z.string().nullable(),
		})
		.nullable(),
});

export type OnboardingResponse = z.infer<typeof onboardingResponseSchema>;
