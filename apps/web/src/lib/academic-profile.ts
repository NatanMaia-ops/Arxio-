export const MAX_SEMESTER = 10;
export const COURSE_MAX_LENGTH = 45;
export const INSTITUTION_MAX_LENGTH = 60;

export const SEMESTERS = Array.from(
	{ length: MAX_SEMESTER },
	(_, index) => index + 1,
);
