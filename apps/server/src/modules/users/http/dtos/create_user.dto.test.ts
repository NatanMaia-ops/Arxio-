import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createUserSchema } from "./create_user.dto";

const validInput = {
	name: "Lucas Silva",
	email: "lucas@gmail.com",
	password: "StrongPass1",
	enrollmentNumber: "20260001",
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

	it("rejects an invalid email", () => {
		const result = createUserSchema.safeParse({
			...validInput,
			email: "invalid-email",
		});

		assert.equal(result.success, false);
	});
});
