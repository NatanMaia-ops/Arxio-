import { drizzleUserRepository } from "./drizzle-user-repository";
import { UsersService } from "./users.service";

export const usersService = new UsersService(drizzleUserRepository);