import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	validateAcademicFields,
	validateUserName,
} from "./onboarding-form.validation";

describe("validateUserName", () => {
	it("normalizes a valid name", () => {
		assert.deepEqual(validateUserName(" Lucas Lima "), {
			name: "Lucas Lima",
			error: null,
		});
	});

	it("accepts 60 characters and rejects 61 characters", () => {
		assert.equal(validateUserName("x".repeat(60)).name?.length, 60);
		assert.deepEqual(validateUserName("x".repeat(61)), {
			name: null,
			error: "O nome deve ter no máximo 60 caracteres.",
		});
	});
});

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

	it("rejects course and institution values above their limits", () => {
		const validValues = {
			course: "x".repeat(45),
			semester: "4",
			institution: "x".repeat(60),
		};

		assert.deepEqual(validateAcademicFields(validValues).errors, {});
		assert.deepEqual(
			validateAcademicFields({
				...validValues,
				course: "x".repeat(46),
			}).errors,
			{ course: "O curso deve ter no máximo 45 caracteres." },
		);
		assert.deepEqual(
			validateAcademicFields({
				...validValues,
				institution: "x".repeat(61),
			}).errors,
			{
				institution: "A instituição/campus deve ter no máximo 60 caracteres.",
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
