import "@arxio/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	output: "standalone",
	async redirects() {
		return [{ source: "/feed", destination: "/artigos", permanent: true }];
	},
};

export default nextConfig;
