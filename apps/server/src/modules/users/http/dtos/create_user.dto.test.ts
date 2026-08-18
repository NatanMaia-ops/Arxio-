import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createUserSchema } from "./create_user.dto";

const validInput = {
	name: "Lucas Silva",
	email: "lucas@gmail.com",
	password: "StrongPass1",
};

describe("createUserSchema", () => {
	it("accepts a public email", () => {
		const result = createUserSchema.safeParse(validInput);

		assert.equal(result.success, true);
	});

	it("accepts an email from any valid domain", () => {
		const result = createUserSchema.safeParse({
			...validInput,
			email: "lucas@example.org",
		});

		assert.equal(result.success, true);
	});

	it("accepts semester 10 and rejects semester 11", () => {
		assert.equal(
			createUserSchema.safeParse({ ...validInput, semester: 10 }).success,
			true,
		);
		assert.equal(
			createUserSchema.safeParse({ ...validInput, semester: 11 }).success,
			false,
		);
	});

	it("accepts a 60-character name and rejects a 61-character name", () => {
		assert.equal(
			createUserSchema.safeParse({ ...validInput, name: "x".repeat(60) })
				.success,
			true,
		);
		assert.equal(
			createUserSchema.safeParse({ ...validInput, name: "x".repeat(61) })
				.success,
			false,
		);
	});

	it("accepts a 45-character course and rejects a 46-character course", () => {
		assert.equal(
			createUserSchema.safeParse({ ...validInput, course: "x".repeat(45) })
				.success,
			true,
		);
		assert.equal(
			createUserSchema.safeParse({ ...validInput, course: "x".repeat(46) })
				.success,
			false,
		);
	});

	it("rejects an invalid email", () => {
		const result = createUserSchema.safeParse({
			...validInput,
			email: "invalid-email",
		});

		assert.equal(result.success, false);
	});
});
