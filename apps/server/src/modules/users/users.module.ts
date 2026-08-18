import { mediaService } from "../media/media.module";

import { drizzleUserRepository } from "./infra/repositories/drizzle-user-repository";
import { UsersService } from "./users.service";

export const usersService = new UsersService(
	drizzleUserRepository,
	mediaService,
);
