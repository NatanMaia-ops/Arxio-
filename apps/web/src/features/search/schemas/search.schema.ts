import { z } from "zod";

export const searchResultSchema = z.object({
	id: z.uuid(),
	title: z.string(),
	authorName: z.string(),
});

export const searchResultListSchema = z.array(searchResultSchema);
