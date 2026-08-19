import { z } from "zod";

export const tagSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	createdAt: z.coerce.date(),
});

export const tagListSchema = z.array(tagSchema);
