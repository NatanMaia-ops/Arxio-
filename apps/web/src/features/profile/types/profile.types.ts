import type { z } from "zod";

import type {
	academicProfileSchema,
	editProfileSchema,
	ownAccountSchema,
	publicProfileSchema,
} from "@/features/profile/schemas/profile.schema";

export type AcademicProfile = z.infer<typeof academicProfileSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type OwnAccount = z.infer<typeof ownAccountSchema>;
export type UpdateProfileInput = z.output<typeof editProfileSchema>;
