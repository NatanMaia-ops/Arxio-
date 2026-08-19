import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/layout/app-shell-frame";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({
	children,
	rail,
}: {
	children: ReactNode;
	rail?: ReactNode;
}) {
	return (
		<AppShellFrame header={<SiteHeader />} rail={rail}>
			{children}
		</AppShellFrame>
	);
}
