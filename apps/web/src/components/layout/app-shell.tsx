import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteSidebar } from "@/components/layout/site-sidebar";

export function AppShell({
	children,
	rail,
}: {
	children: ReactNode;
	rail?: ReactNode;
}) {
	return (
		<div className="min-h-dvh">
			<SiteSidebar />

			<div className="lg:pl-64">
				<SiteHeader />

				<div className="mx-auto flex w-full max-w-336 gap-10 px-5 pt-4 pb-16 sm:px-8 sm:pt-6 lg:px-10">
					<main className="w-full min-w-0">{children}</main>

					{rail}
				</div>
			</div>
		</div>
	);
}
