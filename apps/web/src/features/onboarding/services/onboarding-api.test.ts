import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	fetchOnboardingState,
	OnboardingApiError,
	submitOnboarding,
} from "./onboarding-api";

type CapturedRequest = { input: RequestInfo | URL; init?: RequestInit };

const onboardingState = {
	completed: false,
	user: {
		name: "Lucas Lima",
		email: "lucas@example.com",
	},
	studentProfile: null,
};

describe("Onboarding API", () => {
	it("fetches the current onboarding state with credentials", async () => {
		const requests: CapturedRequest[] = [];
		const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
			requests.push({ input, init });
			return Response.json(onboardingState);
		};

		const state = await fetchOnboardingState("http://localhost:3000/", fetcher);

		assert.deepEqual(state, onboardingState);
		assert.equal(requests[0]?.input, "http://localhost:3000/onboarding");
		assert.deepEqual(requests[0]?.init, {
			credentials: "include",
			cache: "no-store",
		});
	});

	it("submits normalized profile data", async () => {
		const requests: CapturedRequest[] = [];
		const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
			requests.push({ input, init });
			return Response.json({
				...onboardingState,
				completed: true,
				studentProfile: {
					course: null,
					semester: null,
					institution: null,
				},
			});
		};
		const input = {
			name: "Lucas Lima",
			course: null,
			semester: null,
			institution: null,
		};

		await submitOnboarding("http://localhost:3000", input, fetcher);

		const request = requests[0];
		assert.ok(request);
		assert.equal(request.input, "http://localhost:3000/onboarding");
		assert.equal(request.init?.method, "PUT");
		assert.equal(request.init?.credentials, "include");
		assert.equal(request.init?.body, JSON.stringify(input));
	});

	it("exposes the HTTP status for redirect decisions", async () => {
		const fetcher = async () =>
			Response.json(
				{ code: "UNAUTHORIZED", message: "Authentication required" },
				{ status: 401 },
			);

		await assert.rejects(
			fetchOnboardingState("http://localhost:3000", fetcher),
			(error: unknown) =>
				error instanceof OnboardingApiError && error.status === 401,
		);
	});

	it("rejects an invalid success response", async () => {
		const fetcher = async () => Response.json({ completed: "yes" });

		await assert.rejects(
			fetchOnboardingState("http://localhost:3000", fetcher),
			/Invalid onboarding response/,
		);
	});
});
