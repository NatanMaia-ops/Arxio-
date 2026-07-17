import { Router } from "express";
import { z } from "zod";

import { NotFoundError } from "../../../shared/errors";
import type { UsersService } from "../users.service";

import { createUserSchema } from "./dtos/create_user.dto";

const paramsWithIdSchema = z.object({
	id: z.uuid("Informe um id de usuario valido"),
});

export function createUsersController(usersService: UsersService) {
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
