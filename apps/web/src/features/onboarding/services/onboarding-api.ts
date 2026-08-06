import { z } from "zod";

const onboardingStateSchema = z.object({
	completed: z.boolean(),
	user: z.object({
		name: z.string(),
		email: z.email(),
	}),
	studentProfile: z
		.object({
			course: z.string().nullable(),
			semester: z.number().int().nullable(),
			institution: z.string().nullable(),
		})
		.nullable(),
});

export type OnboardingState = z.infer<typeof onboardingStateSchema>;

export type CompleteOnboardingInput = {
	name: string;
	course: string | null;
	semester: number | null;
	institution: string | null;
};

type OnboardingFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export class OnboardingApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "OnboardingApiError";
	}
}

function onboardingUrl(serverUrl: string): string {
	return `${serverUrl.replace(/\/$/, "")}/onboarding`;
}

async function parseOnboardingResponse(
	response: Response,
): Promise<OnboardingState> {
	if (!response.ok) {
		throw new OnboardingApiError(
			response.status,
			"Não foi possível processar o onboarding",
		);
	}

	const data: unknown = await response.json();
	const parsed = onboardingStateSchema.safeParse(data);

	if (!parsed.success) {
		throw new Error("Invalid onboarding response");
	}

	return parsed.data;
}

export async function fetchOnboardingState(
	serverUrl: string,
	fetcher: OnboardingFetch = fetch,
): Promise<OnboardingState> {
	const response = await fetcher(onboardingUrl(serverUrl), {
		credentials: "include",
		cache: "no-store",
	});

	return parseOnboardingResponse(response);
}

export async function submitOnboarding(
	serverUrl: string,
	input: CompleteOnboardingInput,
	fetcher: OnboardingFetch = fetch,
): Promise<OnboardingState> {
	const response = await fetcher(onboardingUrl(serverUrl), {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});

	return parseOnboardingResponse(response);
}
