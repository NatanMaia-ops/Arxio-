import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { completeOnboardingSchema } from "./dtos/complete_onboarding.dto";

const validName = "Lucas Lima";

describe("completeOnboardingSchema academic fields", () => {
	it("accepts a 60-character name and rejects a 61-character name", () => {
		assert.equal(
			completeOnboardingSchema.safeParse({ name: "x".repeat(60) }).success,
			true,
		);
		assert.equal(
			completeOnboardingSchema.safeParse({ name: "x".repeat(61) }).success,
			false,
		);
	});

	it("accepts an empty academic profile and normalizes blank texts", () => {
		assert.deepEqual(
			completeOnboardingSchema.parse({
				name: validName,
				course: " ",
				institution: "",
			}),
			{
				name: validName,
				course: null,
				semester: null,
				institution: null,
			},
		);
	});

	it("accepts a complete academic profile at the semester limit", () => {
		const result = completeOnboardingSchema.safeParse({
			name: validName,
			course: "Ciência da Computação",
			semester: 10,
			institution: "UEPB — Campus VII",
		});

		assert.equal(result.success, true);
	});

	it("accepts the academic text limits and rejects values above them", () => {
		const validAcademicProfile = {
			name: validName,
			course: "x".repeat(45),
			semester: 4,
			institution: "x".repeat(60),
		};

		assert.equal(
			completeOnboardingSchema.safeParse(validAcademicProfile).success,
			true,
		);
		assert.equal(
			completeOnboardingSchema.safeParse({
				...validAcademicProfile,
				course: "x".repeat(46),
			}).success,
			false,
		);
		assert.equal(
			completeOnboardingSchema.safeParse({
				...validAcademicProfile,
				institution: "x".repeat(61),
			}).success,
			false,
		);
	});

	it("rejects a semester above the limit", () => {
		const result = completeOnboardingSchema.safeParse({
			name: validName,
			course: "Ciência da Computação",
			semester: 11,
			institution: "UEPB — Campus VII",
		});

		assert.equal(result.success, false);
	});

	it("rejects every partial academic profile", () => {
		const partialInputs = [
			{ course: "Computação", semester: null, institution: null },
			{ course: null, semester: 4, institution: null },
			{ course: null, semester: null, institution: "UEPB" },
			{ course: "Computação", semester: 4, institution: null },
			{ course: "Computação", semester: null, institution: "UEPB" },
			{ course: null, semester: 4, institution: "UEPB" },
		];

		for (const input of partialInputs) {
			const result = completeOnboardingSchema.safeParse({
				name: validName,
				...input,
			});

			assert.equal(result.success, false);
			if (!result.success) {
				const expectedPaths = Object.entries(input)
					.filter(([, value]) => value === null)
					.map(([field]) => field);
				assert.deepEqual(
					result.error.issues.map((issue) => issue.path.join(".")),
					expectedPaths,
				);
			}
		}
	});
});
