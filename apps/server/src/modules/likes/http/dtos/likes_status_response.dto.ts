import { z } from "zod";

export const likesStatusResponseSchema = z.object({
	count: z.number().int().nonnegative(),
	likedByMe: z.boolean(),
});

export type LikesStatusResponse = z.infer<typeof likesStatusResponseSchema>;
