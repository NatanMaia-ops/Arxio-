import { z } from "zod";

export const likesStatusSchema = z.object({
	count: z.number().int().nonnegative(),
	likedByMe: z.boolean(),
});
