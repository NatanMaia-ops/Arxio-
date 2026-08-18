import { z } from "zod";

import {
	courseTextSchema,
	institutionTextSchema,
} from "../../../../shared/schemas/academic-profile.schema";
import { semesterSchema } from "../../../../shared/schemas/semester.schema";
import { userNameSchema } from "../../../../shared/schemas/user-profile.schema";

export const completeOnboardingSchema = z
	.object({
		name: userNameSchema,
		course: courseTextSchema
			.nullable()
			.optional()
			.transform((value) => value || null),
		semester: semesterSchema
			.nullable()
			.optional()
			.transform((value) => value ?? null),
		institution: institutionTextSchema
			.nullable()
			.optional()
			.transform((value) => value || null),
	})
	.superRefine((input, context) => {
		const filledFields = [
			input.course,
			input.semester,
			input.institution,
		].filter((value) => value !== null).length;

		if (filledFields === 0 || filledFields === 3) return;

		if (input.course === null) {
			context.addIssue({
				code: "custom",
				path: ["course"],
				message: "Informe o curso para completar os dados acadêmicos.",
			});
		}

		if (input.semester === null) {
			context.addIssue({
				code: "custom",
				path: ["semester"],
				message: "Selecione o período para completar os dados acadêmicos.",
			});
		}

		if (input.institution === null) {
			context.addIssue({
				code: "custom",
				path: ["institution"],
				message:
					"Informe a instituição/campus para completar os dados acadêmicos.",
			});
		}
	});

export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>;
