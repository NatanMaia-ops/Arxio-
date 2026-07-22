import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import type { Adapter, AdapterSession, AdapterUser } from "@auth/core/adapters";
import { ExpressAuth, type ExpressAuthConfig, getSession } from "@auth/express";
import express from "express";

const authSecret = "test-auth-secret-with-at-least-32-characters";
const sessionCookieName = "authjs.session-token";
const webOrigin = "http://localhost:3001";

process.env.DATABASE_URL =
	"postgresql://postgres:password@localhost:5432/arxio_test";
process.env.CORS_ORIGIN = webOrigin;
process.env.AUTH_URL = "http://localhost:3000";
process.env.AUTH_SECRET = authSecret;
process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-characters";
process.env.AUTH_GOOGLE_ID = "test-google-client-id";
process.env.AUTH_GOOGLE_SECRET = "test-google-client-secret";
process.env.NODE_ENV = "test";

type CookieJar = Map<string, string>;
type StoredSession = {
	session: AdapterSession;
	user: AdapterUser;
};

const storedSessions = new Map<string, StoredSession>();
const deletedSessionTokens: string[] = [];

function createSessionAdapter(baseAdapter: Adapter): Adapter {
	return {
		...baseAdapter,
		async createSession(session) {
			const storedSession = { ...session };
			const user = Array.from(storedSessions.values()).find(
				(entry) => entry.user.id === session.userId,
			)?.user;

			if (!user) throw new Error("Test session user not found");

			storedSessions.set(session.sessionToken, {
				session: storedSession,
				user,
			});

			return storedSession;
		},
		async getSessionAndUser(sessionToken) {
			return storedSessions.get(sessionToken) ?? null;
		},
		async updateSession(sessionUpdate) {
			const stored = storedSessions.get(sessionUpdate.sessionToken);

			if (!stored) return null;

			const updatedSession = {
				...stored.session,
				...sessionUpdate,
			};

			storedSessions.set(sessionUpdate.sessionToken, {
				...stored,
				session: updatedSession,
			});

			return updatedSession;
		},
		async deleteSession(sessionToken) {
			const stored = storedSessions.get(sessionToken);
			storedSessions.delete(sessionToken);
			deletedSessionTokens.push(sessionToken);

			return stored?.session ?? null;
		},
	};
}

function storeResponseCookies(response: Response, jar: CookieJar): void {
	for (const header of response.headers.getSetCookie()) {
		const [cookiePair = "", ...attributes] = header.split(";");
		const separatorIndex = cookiePair.indexOf("=");

		if (separatorIndex === -1) continue;

		const name = cookiePair.slice(0, separatorIndex);
		const value = cookiePair.slice(separatorIndex + 1);
		const isExpired = attributes.some(
			(attribute) => attribute.trim().toLowerCase() === "max-age=0",
		);

		if (!value || isExpired) {
			jar.delete(name);
			continue;
		}

		jar.set(name, value);
	}
}

function cookieHeader(jar: CookieJar): string {
	return Array.from(jar, ([name, value]) => `${name}=${value}`).join("; ");
}

describe("Auth sign-out flow", () => {
	let origin = "";
	let server: Server;
	let testAuthConfig: ExpressAuthConfig;

	before(async () => {
		const [{ authConfig }, { auth }] = await Promise.all([
			import("../../auth"),
			import("../../middleware"),
		]);
		assert.ok(authConfig.adapter);
		testAuthConfig = {
			...authConfig,
			adapter: createSessionAdapter(authConfig.adapter),
		};
		const app = express();

		app.use("/auth", ExpressAuth(testAuthConfig));
		app.get(
			"/api/protected",
			auth((request) => getSession(request, testAuthConfig)),
			(_request, response) => {
				response.status(200).json(response.locals.session);
			},
		);

		server = await new Promise<Server>((resolve, reject) => {
			const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
			listener.once("error", reject);
		});

		const address = server.address();
		assert.ok(address && typeof address === "object");
		origin = `http://127.0.0.1:${address.port}`;
	});

	after(
		() =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			}),
	);

	it("deletes an authenticated database session and rejects protected access", async () => {
		const userId = "45d0b82d-36b6-4df8-82ba-26f8eec1636f";
		const sessionToken = "database-session-token";
		storedSessions.set(sessionToken, {
			session: {
				sessionToken,
				userId,
				expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			},
			user: {
				id: userId,
				name: "Lucas",
				email: "lucas@example.com",
				emailVerified: null,
				image: null,
			},
		});
		const jar: CookieJar = new Map([[sessionCookieName, sessionToken]]);

		const authenticatedSessionResponse = await fetch(`${origin}/auth/session`, {
			headers: { Cookie: cookieHeader(jar) },
		});
		storeResponseCookies(authenticatedSessionResponse, jar);
		assert.equal(authenticatedSessionResponse.status, 200);
		assert.equal((await authenticatedSessionResponse.json()).user.id, userId);

		const protectedResponse = await fetch(`${origin}/api/protected`, {
			headers: { Cookie: cookieHeader(jar) },
		});
		storeResponseCookies(protectedResponse, jar);
		assert.equal(protectedResponse.status, 200);

		const csrfResponse = await fetch(`${origin}/auth/csrf`, {
			headers: { Cookie: cookieHeader(jar) },
		});
		storeResponseCookies(csrfResponse, jar);
		const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
		const callbackUrl = `${webOrigin}/login`;

		const signOutResponse = await fetch(`${origin}/auth/signout`, {
			method: "POST",
			headers: {
				Cookie: cookieHeader(jar),
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Auth-Return-Redirect": "1",
			},
			body: new URLSearchParams({ csrfToken, callbackUrl }),
		});
		const signOutCookies = signOutResponse.headers.getSetCookie();
		storeResponseCookies(signOutResponse, jar);

		assert.equal(signOutResponse.status, 200);
		assert.deepEqual(await signOutResponse.json(), { url: callbackUrl });
		assert.deepEqual(deletedSessionTokens, [sessionToken]);
		assert.equal(storedSessions.has(sessionToken), false);
		assert.ok(
			signOutCookies.some(
				(cookie) =>
					cookie.startsWith(`${sessionCookieName}=`) &&
					cookie.toLowerCase().includes("max-age=0"),
			),
		);

		const signedOutSessionResponse = await fetch(`${origin}/auth/session`, {
			headers: { Cookie: cookieHeader(jar) },
		});
		assert.equal(signedOutSessionResponse.status, 200);
		assert.equal(await signedOutSessionResponse.json(), null);

		const signedOutProtectedResponse = await fetch(`${origin}/api/protected`, {
			headers: { Cookie: cookieHeader(jar) },
		});
		assert.equal(signedOutProtectedResponse.status, 401);
		assert.deepEqual(await signedOutProtectedResponse.json(), {
			code: "UNAUTHORIZED",
			message: "Authentication required",
		});
	});
});
