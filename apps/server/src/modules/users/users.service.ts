import { hash } from "bcryptjs";

import { ConflictError, NotFoundError } from "../../shared/errors";

import type { UserRepository, UpdateUserInput } from "./user-repository";
import type { User, UserWithPasswordHash } from "./user.entity";
import type { CreateUserInput as CreateUserDtoInput } from "./dtos/create_user.dto";
import type { UserResponse } from "./dtos/user_response.dto";

export class UsersService {
    constructor(private readonly users: UserRepository){}

    async createUser(input: CreateUserDtoInput): Promise<UserResponse> {
        const existing = await this.users.findByEmail(input.email);

        if(existing) {
            throw new ConflictError("E-mail ja cadastrado");
        }

        const passwordHash = await hash(input.password, 12);

        const user = await this.users.create({
            name: input.name,
            email: input.email,
            passwordHash,
        });

        return this.toResponse(user);
    }

    async getUserById(id: string): Promise<UserResponse | null> {
        const user = await this.users.findById(id);
        return user ? this.toResponse(user): null;
    }

    async getUserByEmail(email: string): Promise<UserResponse | null> {
        const user = await this.users.findByEmail(email);
        return user ? this.toResponse(user) : null;
    }

    async getUserWithPasswordByEmail(email: string): Promise<UserWithPasswordHash | null> {
        return this.users.findByEmailWithPasswordHash(email);
    } 

    async updateUser(id: string,input: UpdateUserInput): Promise<UserResponse | null> {
        const updated = await this.users.update(id, input);
        return updated ? this.toResponse(updated) : null;
    }

    async verifyUserEmail(id: string): Promise<void> {
        return this.users.verifyEmail(id);
    }

    async recordLogin(id: string): Promise<void> {
        return this.users.updateLastLoginAt(id);
    }

    async disableUser(id: string): Promise<void> {
        return this.users.disable(id);
    }

    private toResponse(user: User): UserResponse {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            emailVerifiedAt: user.emailVerifiedAt,
            student: null,
            createdAt: user.createdAt,
        };
    }
}