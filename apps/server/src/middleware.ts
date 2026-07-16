import { getSession, type Session } from "@auth/express";
import type { RequestHandler } from "express";

import { authConfig } from "./auth";

export type AuthenticatedSession = Session & {
	user: NonNullable<Session["user"]>;
};

export type AuthenticatedLocals = {
	session: AuthenticatedSession;
};

export function auth(): RequestHandler {
	return async (req, res, next) => {
		try {
			const session = await getSession(req, authConfig);

			if (!session?.user) {
				res.status(401).json({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
				return;
			}

			res.locals.session = {
				...session,
				user: session.user,
			} satisfies AuthenticatedSession;

			next();
		} catch (error) {
			next(error);
		}
	};
}
