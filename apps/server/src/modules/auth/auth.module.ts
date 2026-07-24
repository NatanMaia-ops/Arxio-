import { ExpressAuth, getSession } from "@auth/express";

import { AuthService } from "./auth.service";
import { createRequireAuth } from "./http/auth.middleware";
import { createAuthConfig } from "./infra/authjs/authjs-config";
import { createDrizzleAuthAdapter } from "./infra/authjs/drizzle-auth-adapter";

const authAdapter = createDrizzleAuthAdapter();
const authService = new AuthService(authAdapter);

export const authConfig = createAuthConfig(authAdapter, authService);
export const authHandler = ExpressAuth(authConfig);
export const requireAuth = createRequireAuth((request) =>
	getSession(request, authConfig),
);
