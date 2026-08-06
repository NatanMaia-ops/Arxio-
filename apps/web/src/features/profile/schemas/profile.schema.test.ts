import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { editProfileSchema } from "./profile.schema";

describe("Profile schema", () => {
	it("normalizes raw edit form values", () => {
		assert.deepEqual(
			editProfileSchema.parse({
				name: " Lucas Lima ",
				bio: " ",
				course: " Ciência da Computação ",
				semester: "4",
				institution: null,
			}),
			{
				name: "Lucas Lima",
				bio: null,
				course: "Ciência da Computação",
				semester: 4,
				institution: null,
			},
		);
	});

	it("converts an empty semester to null", () => {
		assert.deepEqual(editProfileSchema.parse({ semester: " " }), {
			semester: null,
		});
	});

	it("accepts partial updates and explicit removals", () => {
		assert.deepEqual(editProfileSchema.parse({ course: null }), {
			course: null,
		});
	});

	it("rejects empty, unknown, or invalid updates", () => {
		const invalidInputs = [
			{},
			{ name: "L" },
			{ bio: "x".repeat(501) },
			{ course: "x".repeat(151) },
			{ institution: "x".repeat(151) },
			{ semester: "0" },
			{ semester: 21 },
			{ semester: "2.5" },
			{ semester: "not-a-number" },
			{ email: "new@example.com" },
		];

		for (const input of invalidInputs) {
			assert.equal(editProfileSchema.safeParse(input).success, false);
		}
	});
});
