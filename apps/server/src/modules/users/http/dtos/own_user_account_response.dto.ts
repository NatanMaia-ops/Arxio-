import { z } from "zod";

import { publicUserProfileResponseSchema } from "./public_user_profile_response.dto";

export const ownUserAccountResponseSchema =
	publicUserProfileResponseSchema.extend({
		email: z.email(),
		hasCustomAvatar: z.boolean(),
	});

export type OwnUserAccountResponse = z.infer<
	typeof ownUserAccountResponseSchema
>;
