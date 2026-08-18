import {
	COURSE_MAX_LENGTH,
	INSTITUTION_MAX_LENGTH,
} from "@/lib/academic-profile";
import { USER_NAME_MAX_LENGTH } from "@/lib/user-profile";

export type AcademicField = "course" | "semester" | "institution";

export type AcademicFieldErrors = Partial<Record<AcademicField, string>>;

export type AcademicInput = {
	course: string | null;
	semester: number | null;
	institution: string | null;
};

type AcademicFormValues = {
	course: string;
	semester: string;
	institution: string;
};

function normalizeOptionalText(value: string): string | null {
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

export function validateUserName(value: string): {
	name: string | null;
	error: string | null;
} {
	const name = value.trim();

	if (name.length < 2) {
		return {
			name: null,
			error: "Informe um nome com pelo menos 2 caracteres.",
		};
	}

	if (name.length > USER_NAME_MAX_LENGTH) {
		return {
			name: null,
			error: `O nome deve ter no máximo ${USER_NAME_MAX_LENGTH} caracteres.`,
		};
	}

	return { name, error: null };
}

export function validateAcademicFields(values: AcademicFormValues): {
	input: AcademicInput;
	errors: AcademicFieldErrors;
} {
	const normalizedSemester = values.semester.trim();
	const input: AcademicInput = {
		course: normalizeOptionalText(values.course),
		semester: normalizedSemester.length > 0 ? Number(normalizedSemester) : null,
		institution: normalizeOptionalText(values.institution),
	};
	const filledFields = Object.values(input).filter(
		(value) => value !== null,
	).length;
	const errors: AcademicFieldErrors = {
		...(input.course && input.course.length > COURSE_MAX_LENGTH
			? {
					course: `O curso deve ter no máximo ${COURSE_MAX_LENGTH} caracteres.`,
				}
			: {}),
		...(input.institution && input.institution.length > INSTITUTION_MAX_LENGTH
			? {
					institution: `A instituição/campus deve ter no máximo ${INSTITUTION_MAX_LENGTH} caracteres.`,
				}
			: {}),
	};

	if (filledFields === 0 || filledFields === 3) {
		return { input, errors };
	}

	return {
		input,
		errors: {
			...errors,
			...(input.course === null
				? { course: "Informe o curso para completar os dados acadêmicos." }
				: {}),
			...(input.semester === null
				? {
						semester: "Selecione o período para completar os dados acadêmicos.",
					}
				: {}),
			...(input.institution === null
				? {
						institution:
							"Informe a instituição/campus para completar os dados acadêmicos.",
					}
				: {}),
		},
	};
}
