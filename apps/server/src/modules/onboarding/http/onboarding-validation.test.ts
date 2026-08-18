import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { completeOnboardingSchema } from "./dtos/complete_onboarding.dto";

const validName = "Lucas Lima";

describe("completeOnboardingSchema academic fields", () => {
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

	it("accepts a complete academic profile", () => {
		const result = completeOnboardingSchema.safeParse({
			name: validName,
			course: "Ciência da Computação",
			semester: 4,
			institution: "UEPB — Campus VII",
		});

		assert.equal(result.success, true);
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
