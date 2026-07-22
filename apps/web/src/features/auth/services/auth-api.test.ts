import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchCsrfToken, requestSignOut } from "./auth-api";

type RecordedRequest = {
	input: RequestInfo | URL;
	init?: RequestInit;
};

describe("Auth API", () => {
	it("fetches a CSRF token with credentials", async () => {
		const requests: RecordedRequest[] = [];
		const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
			requests.push({ input, init });
			return Response.json({ csrfToken: "csrf-token" });
		};

		const csrfToken = await fetchCsrfToken("http://localhost:3000/", fetcher);

		assert.equal(csrfToken, "csrf-token");
		assert.equal(requests[0]?.input, "http://localhost:3000/auth/csrf");
		assert.equal(requests[0]?.init?.credentials, "include");
	});

	it("rejects an invalid CSRF response", async () => {
		const fetcher = async () => Response.json({});

		await assert.rejects(
			fetchCsrfToken("http://localhost:3000", fetcher),
			/Error: Invalid CSRF response/,
		);
	});

	it("reports a failed CSRF request", async () => {
		const fetcher = async () => new Response(null, { status: 503 });

		await assert.rejects(
			fetchCsrfToken("http://localhost:3000", fetcher),
			/Error: Failed to obtain CSRF token/,
		);
	});

	it("posts the sign-out request and returns the redirect URL", async () => {
		const requests: RecordedRequest[] = [];
		const callbackUrl = "http://localhost:3001/login";
		const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
			requests.push({ input, init });

			if (requests.length === 1) {
				return Response.json({ csrfToken: "csrf-token" });
			}

			return Response.json({ url: callbackUrl });
		};

		const redirectUrl = await requestSignOut(
			"http://localhost:3000",
			callbackUrl,
			fetcher,
		);

		const signOutRequest = requests[1];
		assert.equal(redirectUrl, callbackUrl);
		assert.equal(signOutRequest?.input, "http://localhost:3000/auth/signout");
		assert.equal(signOutRequest?.init?.method, "POST");
		assert.equal(signOutRequest?.init?.credentials, "include");
		assert.equal(
			signOutRequest?.init?.headers &&
				new Headers(signOutRequest.init.headers).get("Content-Type"),
			"application/x-www-form-urlencoded",
		);
		assert.equal(
			signOutRequest?.init?.headers &&
				new Headers(signOutRequest.init.headers).get("X-Auth-Return-Redirect"),
			"1",
		);

		const body = signOutRequest?.init?.body;
		assert.ok(body instanceof URLSearchParams);
		assert.equal(body.get("csrfToken"), "csrf-token");
		assert.equal(body.get("callbackUrl"), callbackUrl);
	});

	it("rejects a sign-out response without a valid redirect URL", async () => {
		let requestCount = 0;
		const fetcher = async () => {
			requestCount += 1;

			if (requestCount === 1) {
				return Response.json({ csrfToken: "csrf-token" });
			}

			return Response.json({ url: "/login" });
		};

		await assert.rejects(
			requestSignOut(
				"http://localhost:3000",
				"http://localhost:3001/login",
				fetcher,
			),
			/Error: Invalid sign-out response/,
		);
	});

	it("reports a failed sign-out request", async () => {
		let requestCount = 0;
		const fetcher = async () => {
			requestCount += 1;

			if (requestCount === 1) {
				return Response.json({ csrfToken: "csrf-token" });
			}

			return new Response(null, { status: 500 });
		};

		await assert.rejects(
			requestSignOut(
				"http://localhost:3000",
				"http://localhost:3001/login",
				fetcher,
			),
			/Error: Failed to sign out/,
		);
	});
});
