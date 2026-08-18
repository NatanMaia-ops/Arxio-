import { z } from "zod";

import {
	courseTextSchema,
	institutionTextSchema,
} from "../../../../shared/schemas/academic-profile.schema";
import { semesterSchema } from "../../../../shared/schemas/semester.schema";
import {
	optionalUserBioSchema,
	userNameSchema,
} from "../../../../shared/schemas/user-profile.schema";

const optionalNullableAcademicText = (schema: typeof courseTextSchema) =>
	schema
		.nullable()
		.optional()
		.transform((value) => {
			if (value === undefined) return undefined;
			return value || null;
		});

export const updateOwnProfileSchema = z
	.strictObject({
		name: userNameSchema.optional(),
		bio: optionalUserBioSchema,
		course: optionalNullableAcademicText(courseTextSchema),
		semester: semesterSchema.nullable().optional(),
		institution: optionalNullableAcademicText(institutionTextSchema),
	})
	.refine(
		(input) => Object.values(input).some((value) => value !== undefined),
		{
			message: "Informe ao menos um campo para atualizar",
		},
	);

export type UpdateOwnProfileDto = z.infer<typeof updateOwnProfileSchema>;
