import type { PublicUserProfile } from "./public-user-profile.entity";

export type OwnUserAccount = PublicUserProfile & {
	email: string;
	hasCustomAvatar: boolean;
};
