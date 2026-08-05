import type { PublicUserProfile } from "../../entities/public-user-profile.entity";

export type PublicUserProfileRow = {
	user: {
		id: string;
		name: string;
		bio: string | null;
		avatarUrl: string | null;
		createdAt: Date;
	};
	academicProfile: {
		course: string | null;
		semester: number | null;
		institution: string | null;
	} | null;
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
		...row.user,
		academicProfile: hasAcademicData ? academicProfile : null,
	};
}
