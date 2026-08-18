import { z } from "zod";

export const confirmMediaUploadSchema = z.strictObject({
	objectKey: z.string().min(1).max(700),
});
