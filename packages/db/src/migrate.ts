import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index";

export async function runMigrations() {
	const migrationsFolder = fileURLToPath(
		new URL("./migrations", import.meta.url),
	);

	await migrate(db, { migrationsFolder });
}
