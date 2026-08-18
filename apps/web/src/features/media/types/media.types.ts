import type { z } from "zod";

import type {
	mediaPurposeSchema,
	mediaUploadTicketSchema,
	supportedImageTypeSchema,
} from "@/features/media/schemas/media.schema";

export type MediaPurpose = z.infer<typeof mediaPurposeSchema>;
export type MediaUploadTicket = z.infer<typeof mediaUploadTicketSchema>;
export type SupportedImageType = z.infer<typeof supportedImageTypeSchema>;
export type MediaUploadStage = "preparing" | "uploading" | "saving";
