import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateAcademicFields } from "./onboarding-form.validation";

describe("validateAcademicFields", () => {
	it("accepts an empty academic profile", () => {
		assert.deepEqual(
			validateAcademicFields({
				course: "  ",
				semester: "",
				institution: " ",
			}),
			{
				input: { course: null, semester: null, institution: null },
				errors: {},
			},
		);
	});

	it("normalizes and accepts a complete academic profile", () => {
		assert.deepEqual(
			validateAcademicFields({
				course: " Ciência da Computação ",
				semester: "4",
				institution: " UEPB — Campus VII ",
			}),
			{
				input: {
					course: "Ciência da Computação",
					semester: 4,
					institution: "UEPB — Campus VII",
				},
				errors: {},
			},
		);
	});

	it("marks every missing field when academic data is partial", () => {
		const cases = [
			{
				values: { course: "Computação", semester: "", institution: "" },
				expectedErrors: ["semester", "institution"],
			},
			{
				values: { course: "", semester: "4", institution: "UEPB" },
				expectedErrors: ["course"],
			},
		];

		for (const { values, expectedErrors } of cases) {
			assert.deepEqual(
				Object.keys(validateAcademicFields(values).errors),
				expectedErrors,
			);
		}
	});
});
