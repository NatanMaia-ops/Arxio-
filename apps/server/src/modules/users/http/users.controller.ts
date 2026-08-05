import { type RequestHandler, type Response, Router } from "express";
import { z } from "zod";

import { NotFoundError } from "../../../shared/errors";
import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { UsersService } from "../users.service";

import { createUserSchema } from "./dtos/create_user.dto";
import { ownUserAccountResponseSchema } from "./dtos/own_user_account_response.dto";
import { publicUserProfileResponseSchema } from "./dtos/public_user_profile_response.dto";
import {
	type UpdateOwnProfileDto,
	updateOwnProfileSchema,
} from "./dtos/update_own_profile.dto";

const paramsWithIdSchema = z.object({
	id: z.uuid("Informe um id de usuario valido"),
});

type UsersControllerService = Pick<
	UsersService,
	| "createUser"
	| "getUserById"
	| "getPublicProfileById"
	| "getOwnAccount"
	| "updateOwnProfile"
>;

function toUpdateOwnProfileInput(input: UpdateOwnProfileDto) {
	const { course, semester, institution, ...personalData } = input;
	const hasAcademicUpdate = [course, semester, institution].some(
		(value) => value !== undefined,
	);

	return {
		...personalData,
		...(hasAcademicUpdate
			? {
					academicProfile: {
						...(course !== undefined ? { course } : {}),
						...(semester !== undefined ? { semester } : {}),
						...(institution !== undefined ? { institution } : {}),
					},
				}
			: {}),
	};
}

export function createUsersController(
	usersService: UsersControllerService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.post("/", async (req, res, next) => {
		try {
			const input = createUserSchema.parse(req.body);
			const user = await usersService.createUser(input);

			res.status(201).json(user);
		} catch (error) {
			next(error);
		}
	});

	router.get(
		"/me",
		requireAuth,
		async (_req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const account = await usersService.getOwnAccount(
					res.locals.session.user.id,
				);

				res.status(200).json(ownUserAccountResponseSchema.parse(account));
			} catch (error) {
				next(error);
			}
		},
	);

	router.patch(
		"/me",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const input = updateOwnProfileSchema.parse(req.body);
				const account = await usersService.updateOwnProfile(
					res.locals.session.user.id,
					toUpdateOwnProfileInput(input),
				);

				res.status(200).json(ownUserAccountResponseSchema.parse(account));
			} catch (error) {
				next(error);
			}
		},
	);

	router.get("/:id/profile", async (req, res, next) => {
		try {
			const { id } = paramsWithIdSchema.parse(req.params);
			const profile = await usersService.getPublicProfileById(id);

			res.status(200).json(publicUserProfileResponseSchema.parse(profile));
		} catch (error) {
			next(error);
		}
	});

	router.get("/:id", async (req, res, next) => {
		try {
			const { id } = paramsWithIdSchema.parse(req.params);
			const user = await usersService.getUserById(id);

			if (!user) {
				throw new NotFoundError("Usuario nao encontrado");
			}

			res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	});

	return router;
}
