import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ConflictError, NotFoundError } from "../../shared/errors";

import type { OnboardingState } from "./entities/onboarding.entity";
import { OnboardingService } from "./onboarding.service";
import type {
	CompleteOnboardingInput,
	OnboardingRepository,
} from "./repositories/onboarding-repository";

const incompleteState: OnboardingState = {
	completed: false,
	user: {
		name: "Lucas Lima",
		email: "lucas@example.com",
	},
	studentProfile: null,
};

const completedState: OnboardingState = {
	...incompleteState,
	completed: true,
	studentProfile: {
		course: "Ciência da Computação",
		semester: 4,
		institution: "UEPB — Campus VII",
	},
};

function createRepository(
	overrides: Partial<OnboardingRepository> = {},
): OnboardingRepository {
	return {
		async findByUserId() {
			return incompleteState;
		},
		async complete() {
			return {
				status: "completed",
				state: completedState,
			};
		},
		...overrides,
	};
}

describe("OnboardingService", () => {
	it("returns the onboarding state for the authenticated user", async () => {
		const service = new OnboardingService(createRepository());

		const state = await service.getState("user-id");

		assert.equal(state, incompleteState);
	});

	it("completes onboarding with optional academic data", async () => {
		let receivedInput: CompleteOnboardingInput | null = null;
		const repository = createRepository({
			async complete(_userId, input) {
				receivedInput = input;
				return {
					status: "completed",
					state: completedState,
				};
			},
		});
		const service = new OnboardingService(repository);
		const input: CompleteOnboardingInput = {
			name: "Lucas Lima",
			course: "Ciência da Computação",
			semester: 4,
			institution: "UEPB — Campus VII",
		};

		const state = await service.complete("user-id", input);

		assert.equal(receivedInput, input);
		assert.equal(state, completedState);
	});

	it("allows skipping academic fields with null values", async () => {
		let receivedInput: CompleteOnboardingInput | null = null;
		const skippedState: OnboardingState = {
			...completedState,
			studentProfile: {
				course: null,
				semester: null,
				institution: null,
			},
		};
		const repository = createRepository({
			async complete(_userId, input) {
				receivedInput = input;
				return {
					status: "completed",
					state: skippedState,
				};
			},
		});
		const service = new OnboardingService(repository);

		await service.complete("user-id", {
			name: "Lucas Lima",
			course: null,
			semester: null,
			institution: null,
		});

		assert.deepEqual(receivedInput, {
			name: "Lucas Lima",
			course: null,
			semester: null,
			institution: null,
		});
	});

	it("rejects a second onboarding completion", async () => {
		const repository = createRepository({
			async complete() {
				return {
					status: "already-completed",
					state: completedState,
				};
			},
		});
		const service = new OnboardingService(repository);

		await assert.rejects(
			service.complete("user-id", {
				name: "Outro Nome",
				course: null,
				semester: null,
				institution: null,
			}),
			ConflictError,
		);
	});

	it("reports an authenticated user missing from persistence", async () => {
		const repository = createRepository({
			async findByUserId() {
				return null;
			},
		});
		const service = new OnboardingService(repository);

		await assert.rejects(service.getState("missing-user"), NotFoundError);
	});
});
