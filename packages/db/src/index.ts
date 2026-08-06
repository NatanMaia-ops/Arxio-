import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { env } from "@arxio/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

function sslConfig() {
	if (!env.DATABASE_URL.includes("sslmode=")) {
		return false;
	}

	const ca = readFileSync(
		fileURLToPath(new URL("./rds-ca.pem", import.meta.url)),
		"utf8",
	);

	return { ca, rejectUnauthorized: true };
}

function connectionString() {
	const url = new URL(env.DATABASE_URL);
	url.searchParams.delete("sslmode");

	return url.toString();
}

export function createDb() {
	return drizzle({
		connection: { connectionString: connectionString(), ssl: sslConfig() },
		schema,
	});
}

export const db = createDb();
