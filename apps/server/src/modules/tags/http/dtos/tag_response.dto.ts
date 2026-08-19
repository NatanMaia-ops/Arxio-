import { z } from "zod";

export const tagResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	createdAt: z.coerce.date(),
});

export type TagResponse = z.infer<typeof tagResponseSchema>;
