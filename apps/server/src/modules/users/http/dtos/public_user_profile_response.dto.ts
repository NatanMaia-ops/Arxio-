import { z } from "zod";

export const academicProfileResponseSchema = z.object({
	course: z.string().nullable(),
	semester: z.number().int().nullable(),
	institution: z.string().nullable(),
});

export const publicUserProfileResponseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	bio: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	academicProfile: academicProfileResponseSchema.nullable(),
	createdAt: z.coerce.date(),
});

export type PublicUserProfileResponse = z.infer<
	typeof publicUserProfileResponseSchema
>;
