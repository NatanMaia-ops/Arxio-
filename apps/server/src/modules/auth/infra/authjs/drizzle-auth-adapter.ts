import { db } from "@arxio/db";
import { accounts } from "@arxio/db/schema/account";
import { sessions } from "@arxio/db/schema/session";
import { users } from "@arxio/db/schema/user";
import { verificationTokens } from "@arxio/db/schema/verification-token";
import type { Adapter } from "@auth/core/adapters";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import type { AuthRepository } from "../../repositories/auth-repository";

type RequiredSessionAdapter = Required<
	Pick<
		Adapter,
		"createSession" | "deleteSession" | "getSessionAndUser" | "updateSession"
	>
>;

export type AuthJsAdapter = Adapter & AuthRepository & RequiredSessionAdapter;

function assertRequiredMethods(
	adapter: Adapter,
): asserts adapter is AuthJsAdapter {
	if (
		!adapter.createUser ||
		!adapter.getUser ||
		!adapter.getUserByAccount ||
		!adapter.getUserByEmail ||
		!adapter.linkAccount ||
		!adapter.createSession ||
		!adapter.getSessionAndUser ||
		!adapter.updateSession ||
		!adapter.deleteSession
	) {
		throw new Error("Auth adapter is missing required methods");
	}
}

export function createDrizzleAuthAdapter(): AuthJsAdapter {
	const adapter = DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	});

	assertRequiredMethods(adapter);

	return adapter;
}
