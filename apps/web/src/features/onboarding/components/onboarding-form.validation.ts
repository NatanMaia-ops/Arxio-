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

	if (filledFields === 0 || filledFields === 3) {
		return { input, errors: {} };
	}

	return {
		input,
		errors: {
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
