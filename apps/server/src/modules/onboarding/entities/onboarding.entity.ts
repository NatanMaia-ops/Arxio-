export type AcademicProfile = {
	course: string | null;
	semester: number | null;
	institution: string | null;
};

export type OnboardingState = {
	completed: boolean;
	user: {
		name: string;
		email: string;
	};
	studentProfile: AcademicProfile | null;
};
