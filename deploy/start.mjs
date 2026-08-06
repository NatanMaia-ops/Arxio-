import { spawn } from "node:child_process";

const apiPort = process.env.PORT ?? "3000";
const webPort = process.env.WEB_PORT ?? "3001";

const children = [
	spawn(process.execPath, ["web-standalone/apps/web/server.js"], {
		stdio: "inherit",
		env: { ...process.env, PORT: webPort, HOSTNAME: "127.0.0.1" },
	}),
	spawn(process.execPath, ["apps/server/dist/index.mjs"], {
		stdio: "inherit",
		env: {
			...process.env,
			PORT: apiPort,
			WEB_INTERNAL_URL: `http://127.0.0.1:${webPort}`,
		},
	}),
];

let stopping = false;

function shutdown(code) {
	if (stopping) return;
	stopping = true;

	for (const child of children) {
		child.kill("SIGTERM");
	}

	process.exit(code);
}

for (const child of children) {
	child.on("exit", (code) => shutdown(code ?? 1));
	child.on("error", () => shutdown(1));
}

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
