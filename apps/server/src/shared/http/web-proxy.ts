import { request } from "node:http";
import type { NextFunction, Request, Response } from "express";

export function createWebProxy(target: string) {
	const { hostname, port } = new URL(target);

	return (req: Request, res: Response, next: NextFunction) => {
		const upstream = request(
			{
				hostname,
				port,
				path: req.originalUrl,
				method: req.method,
				headers: { ...req.headers, "x-forwarded-proto": "http" },
			},
			(proxied) => {
				res.writeHead(proxied.statusCode ?? 502, proxied.headers);
				proxied.pipe(res);
			},
		);

		upstream.on("error", next);
		req.pipe(upstream);
	};
}
