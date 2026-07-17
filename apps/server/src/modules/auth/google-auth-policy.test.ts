import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canSignInWithGoogle } from "./google-auth-policy";

describe("Google auth policy", () => {
	it("accepts a verified Gmail account", () => {
		assert.equal(
			canSignInWithGoogle(
				{ provider: "google" },
				{ email: "lucas@gmail.com", email_verified: true },
			),
			true,
		);
	});

	it("accepts a verified Google Workspace account from any domain", () => {
		assert.equal(
			canSignInWithGoogle(
				{ provider: "google" },
				{
					email: "lucas@another-university.edu",
					email_verified: true,
					hd: "another-university.edu",
				},
			),
			true,
		);
	});

	it("rejects an unverified Google account", () => {
		assert.equal(
			canSignInWithGoogle({ provider: "google" }, { email_verified: false }),
			false,
		);
	});

	it("rejects accounts from other providers", () => {
		assert.equal(
			canSignInWithGoogle({ provider: "github" }, { email_verified: true }),
			false,
		);
	});
});
