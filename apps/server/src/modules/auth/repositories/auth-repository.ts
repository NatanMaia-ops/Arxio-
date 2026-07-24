import type { Adapter } from "@auth/core/adapters";

export type AuthRepository = Required<
	Pick<
		Adapter,
		| "createUser"
		| "getUser"
		| "getUserByAccount"
		| "getUserByEmail"
		| "linkAccount"
	>
>;
