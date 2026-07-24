import type { Session } from "@auth/express";
import type { Request, RequestHandler } from "express";

export type SessionReader = (request: Request) => Promise<Session | null>;

export type AuthenticatedSession = Session & {
	user: NonNullable<Session["user"]> & {
		id: string;
	};
};

export type AuthenticatedLocals = {
	session: AuthenticatedSession;
};

export function createRequireAuth(readSession: SessionReader): RequestHandler {
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
