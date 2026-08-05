import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	type PublicUserProfileRow,
	toOwnUserAccount,
	toPublicUserProfile,
} from "./public-user-profile-mapper";

const createdAt = new Date("2026-08-05T12:00:00.000Z");

function createRow(
	academicProfile: PublicUserProfileRow["academicProfile"],
): PublicUserProfileRow {
	return {
		user: {
			id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
			name: "Lucas Lima",
			bio: "Estudante e desenvolvedor",
			avatarUrl: "https://example.com/avatar.png",
			createdAt,
		},
		academicProfile,
	};
}

describe("toPublicUserProfile", () => {
	it("maps a user without a student profile", () => {
		const profile = toPublicUserProfile(createRow(null));

		assert.equal(profile.academicProfile, null);
	});

	it("maps an empty student profile to null", () => {
		const profile = toPublicUserProfile(
			createRow({
				course: null,
				semester: null,
				institution: null,
			}),
		);

		assert.equal(profile.academicProfile, null);
	});

	it("maps a complete academic profile", () => {
		const profile = toPublicUserProfile(
			createRow({
				course: "Ciência da Computação",
				semester: 4,
				institution: "UEPB — Campus VII",
			}),
		);

		assert.deepEqual(profile.academicProfile, {
			course: "Ciência da Computação",
			semester: 4,
			institution: "UEPB — Campus VII",
		});
	});

	it("maps a partially filled academic profile", () => {
		const profile = toPublicUserProfile(
			createRow({
				course: "Ciência da Computação",
				semester: null,
				institution: null,
			}),
		);

		assert.deepEqual(profile.academicProfile, {
			course: "Ciência da Computação",
			semester: null,
			institution: null,
		});
	});

	it("returns only public profile fields", () => {
		const profile = toPublicUserProfile(createRow(null));

		assert.deepEqual(profile, {
			id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
			name: "Lucas Lima",
			bio: "Estudante e desenvolvedor",
			avatarUrl: "https://example.com/avatar.png",
			academicProfile: null,
			createdAt,
		});
	});

	it("adds email only to the authenticated user's account", () => {
		const account = toOwnUserAccount({
			...createRow(null),
			user: {
				...createRow(null).user,
				email: "lucas@example.com",
			},
		});

		assert.deepEqual(account, {
			id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
			name: "Lucas Lima",
			email: "lucas@example.com",
			bio: "Estudante e desenvolvedor",
			avatarUrl: "https://example.com/avatar.png",
			academicProfile: null,
			createdAt,
		});
	});
});
