import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NotFoundError } from "../../shared/errors";
import { MediaService } from "../media/media.service";
import type { ObjectStorage } from "../media/object-storage";

import type { OwnUserAccount } from "./entities/own-user-account.entity";
import type { PublicUserProfile } from "./entities/public-user-profile.entity";
import type { User } from "./entities/user.entity";
import type {
	UpdateOwnProfileInput,
	UserRepository,
} from "./repositories/user-repository";
import { UsersService } from "./users.service";

const userId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
const createdAt = new Date("2026-08-05T12:00:00.000Z");
const updatedAt = new Date("2026-08-05T13:00:00.000Z");

const user: User = {
	id: userId,
	name: "Lucas Lima",
	email: "lucas@example.com",
	bio: null,
	avatarUrl: null,
	avatarObjectKey: null,
	emailVerifiedAt: null,
	lastLoginAt: null,
	disabledAt: null,
	createdAt,
	updatedAt,
};

const publicProfile: PublicUserProfile = {
	id: user.id,
	name: user.name,
	bio: user.bio,
	avatarUrl: user.avatarUrl,
	avatarObjectKey: user.avatarObjectKey,
	academicProfile: null,
	createdAt: user.createdAt,
};

const ownAccount: OwnUserAccount = {
	...publicProfile,
	email: user.email,
	hasCustomAvatar: false,
};

function createRepository(
	overrides: Partial<UserRepository> = {},
): UserRepository {
	return {
		async create() {
			return user;
		},
		async findById() {
			return user;
		},
		async findProfileById() {
			return publicProfile;
		},
		async findOwnAccountById() {
			return ownAccount;
		},
		async findByEmail() {
			return null;
		},
		async findByEmailWithPasswordHash() {
			return null;
		},
		async updateOwnProfile() {
			return ownAccount;
		},
		async replaceAvatarObjectKey() {
			return { account: ownAccount, previousObjectKey: null };
		},
		async updateLastLoginAt() {},
		async verifyEmail() {},
		async disable() {},
		...overrides,
	};
}

describe("UsersService profile use cases", () => {
	it("returns a public profile by id", async () => {
		const service = new UsersService(createRepository());

		const result = await service.getPublicProfileById(userId);

		assert.deepEqual(result, publicProfile);
	});

	it("reports a missing public profile", async () => {
		const repository = createRepository({
			async findProfileById() {
				return null;
			},
		});
		const service = new UsersService(repository);

		await assert.rejects(service.getPublicProfileById(userId), NotFoundError);
	});

	it("returns the authenticated user's own account", async () => {
		const service = new UsersService(createRepository());

		const result = await service.getOwnAccount(userId);

		assert.deepEqual(result, ownAccount);
	});

	it("reports a missing own account", async () => {
		const repository = createRepository({
			async findOwnAccountById() {
				return null;
			},
		});
		const service = new UsersService(repository);

		await assert.rejects(service.getOwnAccount(userId), NotFoundError);
	});

	it("updates personal data without academic information", async () => {
		let receivedUserId: string | null = null;
		let receivedInput: UpdateOwnProfileInput | null = null;
		const repository = createRepository({
			async updateOwnProfile(authenticatedUserId, input) {
				receivedUserId = authenticatedUserId;
				receivedInput = input;
				return {
					...ownAccount,
					name: input.name ?? ownAccount.name,
					bio: input.bio ?? ownAccount.bio,
				};
			},
		});
		const service = new UsersService(repository);
		const input: UpdateOwnProfileInput = {
			name: "Lucas Atualizado",
			bio: "Nova biografia",
		};

		const result = await service.updateOwnProfile(userId, input);

		assert.equal(receivedUserId, userId);
		assert.equal(receivedInput, input);
		assert.equal(result.name, "Lucas Atualizado");
		assert.equal(result.bio, "Nova biografia");
	});

	it("allows removing the biography", async () => {
		let receivedInput: UpdateOwnProfileInput | null = null;
		const repository = createRepository({
			async updateOwnProfile(_authenticatedUserId, input) {
				receivedInput = input;
				return { ...ownAccount, bio: null };
			},
		});
		const service = new UsersService(repository);

		await service.updateOwnProfile(userId, { bio: null });

		assert.deepEqual(receivedInput, { bio: null });
	});

	it("forwards complete academic information", async () => {
		let receivedInput: UpdateOwnProfileInput | null = null;
		const repository = createRepository({
			async updateOwnProfile(_authenticatedUserId, input) {
				receivedInput = input;
				return ownAccount;
			},
		});
		const service = new UsersService(repository);
		const input: UpdateOwnProfileInput = {
			academicProfile: {
				course: "Ciência da Computação",
				semester: 4,
				institution: "UEPB — Campus VII",
			},
		};

		await service.updateOwnProfile(userId, input);

		assert.equal(receivedInput, input);
	});

	it("forwards partial academic updates and null removals", async () => {
		let receivedInput: UpdateOwnProfileInput | null = null;
		const repository = createRepository({
			async updateOwnProfile(_authenticatedUserId, input) {
				receivedInput = input;
				return ownAccount;
			},
		});
		const service = new UsersService(repository);
		const input: UpdateOwnProfileInput = {
			academicProfile: {
				course: null,
				semester: 5,
			},
		};

		await service.updateOwnProfile(userId, input);

		assert.equal(receivedInput, input);
	});

	it("reports a missing user during update", async () => {
		const repository = createRepository({
			async updateOwnProfile() {
				return null;
			},
		});
		const service = new UsersService(repository);

		await assert.rejects(
			service.updateOwnProfile(userId, { name: "Lucas Atualizado" }),
			NotFoundError,
		);
	});

	it("promotes an avatar and prioritizes its public URL", async () => {
		const pendingKey = `pending/${userId}/avatar/11111111-1111-4111-8111-111111111111.jpg`;
		const oldKey = `avatars/${userId}/old.jpg`;
		const deleted: string[] = [];
		let storedKey: string | null = null;
		const storage: ObjectStorage = {
			async createPresignedUpload() {
				throw new Error("not used");
			},
			async getMetadata() {
				return { contentType: "image/jpeg", sizeBytes: 1024 };
			},
			async copy(_source, destination) {
				storedKey = destination;
			},
			async delete(key) {
				deleted.push(key);
			},
		};
		const repository = createRepository({
			async replaceAvatarObjectKey(_authenticatedUserId, objectKey) {
				storedKey = objectKey;
				return {
					account: {
						...ownAccount,
						avatarUrl: "https://accounts.google.com/avatar.jpg",
						avatarObjectKey: objectKey,
						hasCustomAvatar: true,
					},
					previousObjectKey: oldKey,
				};
			},
		});
		const service = new UsersService(
			repository,
			new MediaService(storage, "https://media.example.com"),
		);

		const account = await service.setOwnAvatar(userId, pendingKey);

		assert.ok(storedKey);
		assert.equal(account.avatarUrl, `https://media.example.com/${storedKey}`);
		assert.deepEqual(deleted, [pendingKey, oldKey]);
	});

	it("removes the uploaded avatar and falls back to the external URL", async () => {
		const oldKey = `avatars/${userId}/old.jpg`;
		const deleted: string[] = [];
		const storage: ObjectStorage = {
			async createPresignedUpload() {
				throw new Error("not used");
			},
			async getMetadata() {
				return null;
			},
			async copy() {},
			async delete(key) {
				deleted.push(key);
			},
		};
		const externalAvatarUrl = "https://accounts.google.com/avatar.jpg";
		const repository = createRepository({
			async replaceAvatarObjectKey(_authenticatedUserId, objectKey) {
				assert.equal(objectKey, null);
				return {
					account: {
						...ownAccount,
						avatarUrl: externalAvatarUrl,
						avatarObjectKey: null,
						hasCustomAvatar: false,
					},
					previousObjectKey: oldKey,
				};
			},
		});
		const service = new UsersService(
			repository,
			new MediaService(storage, "https://media.example.com"),
		);

		const account = await service.removeOwnAvatar(userId);

		assert.equal(account.avatarUrl, externalAvatarUrl);
		assert.deepEqual(deleted, [oldKey]);
	});
});
