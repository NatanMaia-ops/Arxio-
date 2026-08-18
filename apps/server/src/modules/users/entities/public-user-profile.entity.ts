export type PublicUserProfile = {
	id: string;
	name: string;
	bio: string | null;
	avatarUrl: string | null;
	avatarObjectKey: string | null;
	academicProfile: {
		course: string | null;
		semester: number | null;
		institution: string | null;
	} | null;
	createdAt: Date;
};
