import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { updateOwnProfileSchema } from "./update_own_profile.dto";

describe("updateOwnProfileSchema", () => {
	it("accepts a 60-character name and rejects a 61-character name", () => {
		assert.equal(
			updateOwnProfileSchema.safeParse({ name: "x".repeat(60) }).success,
			true,
		);
		assert.equal(
			updateOwnProfileSchema.safeParse({ name: "x".repeat(61) }).success,
			false,
		);
	});

	it("accepts a 300-character bio and rejects a 301-character bio", () => {
		assert.equal(
			updateOwnProfileSchema.safeParse({ bio: "x".repeat(300) }).success,
			true,
		);
		assert.equal(
			updateOwnProfileSchema.safeParse({ bio: "x".repeat(301) }).success,
			false,
		);
	});

	it("accepts the academic text limits and rejects values above them", () => {
		assert.equal(
			updateOwnProfileSchema.safeParse({ course: "x".repeat(45) }).success,
			true,
		);
		assert.equal(
			updateOwnProfileSchema.safeParse({ course: "x".repeat(46) }).success,
			false,
		);
		assert.equal(
			updateOwnProfileSchema.safeParse({ institution: "x".repeat(60) }).success,
			true,
		);
		assert.equal(
			updateOwnProfileSchema.safeParse({ institution: "x".repeat(61) }).success,
			false,
		);
	});

	it("normalizes an empty bio to null", () => {
		assert.deepEqual(updateOwnProfileSchema.parse({ bio: " " }), {
			bio: null,
		});
	});
});
