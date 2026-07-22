import type { Session } from "@auth/express";
import type { RequestHandler } from "express";

import { authService } from "./auth";
import type { SessionReader } from "./modules/auth/auth.service";

export type AuthenticatedSession = Session & {
	user: NonNullable<Session["user"]> & {
		id: string;
	};
};

export type AuthenticatedLocals = {
	session: AuthenticatedSession;
};

export function auth(
	readSession: SessionReader = (request) => authService.getSession(request),
): RequestHandler {
	return async (req, res, next) => {
		try {
			const session = await readSession(req);
			const sessionUser = session?.user;

			if (!sessionUser || typeof sessionUser.id !== "string") {
				res.status(401).json({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
				return;
			}

			res.locals.session = {
				...session,
				user: {
					...sessionUser,
					id: sessionUser.id,
				},
			} satisfies AuthenticatedSession;

			next();
		} catch (error) {
			next(error);
		}
	};
}
