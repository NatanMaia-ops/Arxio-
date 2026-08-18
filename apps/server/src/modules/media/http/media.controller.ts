import { type RequestHandler, type Response, Router } from "express";

import type { AuthenticatedLocals } from "../../auth/http/auth.middleware";
import type { MediaService } from "../media.service";

import {
	createMediaUploadSchema,
	mediaUploadResponseSchema,
} from "./dtos/create_media_upload.dto";

export function createMediaController(
	mediaService: MediaService,
	requireAuth: RequestHandler,
) {
	const router = Router();

	router.post(
		"/uploads",
		requireAuth,
		async (req, res: Response<unknown, AuthenticatedLocals>, next) => {
			try {
				const input = createMediaUploadSchema.parse(req.body);
				const ticket = await mediaService.createUpload(
					res.locals.session.user.id,
					input.purpose,
					input.contentType,
				);

				res.status(201).json(
					mediaUploadResponseSchema.parse({
						...ticket,
						uploadUrl: ticket.url,
					}),
				);
			} catch (error) {
				next(error);
			}
		},
	);

	return router;
}
