import { z } from "zod";

import { semesterSchema } from "../../../../shared/schemas/semester.schema";

const optionalTextSchema = z
	.string()
	.trim()
	.max(150, "O campo deve ter no máximo 150 caracteres")
	.nullable()
	.optional()
	.transform((value) => value || null);

export const completeOnboardingSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, "O nome deve ter no mínimo 2 caracteres")
			.max(150, "O nome deve ter no máximo 150 caracteres"),
		course: optionalTextSchema,
		semester: semesterSchema
			.nullable()
			.optional()
			.transform((value) => value ?? null),
		institution: optionalTextSchema,
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
