import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { editProfileSchema, profileIdSchema } from "./profile.schema";

describe("Profile schema", () => {
	it("accepts only UUIDs as public profile ids", () => {
		assert.equal(
			profileIdSchema.safeParse("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d").success,
			true,
		);
		assert.equal(profileIdSchema.safeParse("invalid-id").success, false);
	});

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

	it("accepts semester 10 and rejects semester 11", () => {
		assert.deepEqual(editProfileSchema.parse({ semester: "10" }), {
			semester: 10,
		});
		assert.equal(
			editProfileSchema.safeParse({ semester: "11" }).success,
			false,
		);
	});

	it("accepts the profile text limits and rejects values above them", () => {
		assert.equal(
			editProfileSchema.safeParse({ name: "x".repeat(60) }).success,
			true,
		);
		assert.equal(
			editProfileSchema.safeParse({ name: "x".repeat(61) }).success,
			false,
		);
		assert.equal(
			editProfileSchema.safeParse({ bio: "x".repeat(300) }).success,
			true,
		);
		assert.equal(
			editProfileSchema.safeParse({ bio: "x".repeat(301) }).success,
			false,
		);
	});

	it("accepts the academic text limits and rejects values above them", () => {
		assert.equal(
			editProfileSchema.safeParse({ course: "x".repeat(45) }).success,
			true,
		);
		assert.equal(
			editProfileSchema.safeParse({ course: "x".repeat(46) }).success,
			false,
		);
		assert.equal(
			editProfileSchema.safeParse({ institution: "x".repeat(60) }).success,
			true,
		);
		assert.equal(
			editProfileSchema.safeParse({ institution: "x".repeat(61) }).success,
			false,
		);
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
			{ bio: "x".repeat(301) },
			{ course: "x".repeat(46) },
			{ institution: "x".repeat(61) },
			{ semester: "0" },
			{ semester: 11 },
			{ semester: "2.5" },
			{ semester: "not-a-number" },
			{ email: "new@example.com" },
		];

		for (const input of invalidInputs) {
			assert.equal(editProfileSchema.safeParse(input).success, false);
		}
	});
});
