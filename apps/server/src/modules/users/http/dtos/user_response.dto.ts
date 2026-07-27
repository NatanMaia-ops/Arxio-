import { z } from "zod";

export const UserResponseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.email(),

	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),

	emailVerifiedAt: z.coerce.date().nullable(),

	student: z
		.object({
			course: z.string().nullable(),
			semester: z.number().nullable(),
			institution: z.string().nullable(),
		})
		.nullable(),

	createdAt: z.coerce.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
