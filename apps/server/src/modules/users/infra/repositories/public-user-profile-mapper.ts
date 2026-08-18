import type { OwnUserAccount } from "../../entities/own-user-account.entity";
import type { PublicUserProfile } from "../../entities/public-user-profile.entity";

export type PublicUserProfileRow = {
	user: {
		id: string;
		name: string;
		bio: string | null;
		avatarUrl: string | null;
		avatarObjectKey: string | null;
		createdAt: Date;
	};
	academicProfile: {
		course: string | null;
		semester: number | null;
		institution: string | null;
	} | null;
};

export type OwnUserAccountRow = PublicUserProfileRow & {
	user: PublicUserProfileRow["user"] & {
		email: string;
	};
};

export function toPublicUserProfile(
	row: PublicUserProfileRow,
): PublicUserProfile {
	const academicProfile = row.academicProfile;
	const hasAcademicData =
		academicProfile !== null &&
		(academicProfile.course !== null ||
			academicProfile.semester !== null ||
			academicProfile.institution !== null);

	return {
		id: row.user.id,
		name: row.user.name,
		bio: row.user.bio,
		avatarUrl: row.user.avatarUrl,
		avatarObjectKey: row.user.avatarObjectKey,
		academicProfile: hasAcademicData ? academicProfile : null,
		createdAt: row.user.createdAt,
	};
}

export function toOwnUserAccount(row: OwnUserAccountRow): OwnUserAccount {
	return {
		...toPublicUserProfile(row),
		email: row.user.email,
		hasCustomAvatar: row.user.avatarObjectKey !== null,
	};
}
