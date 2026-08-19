import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/layout/app-shell-frame";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({
	children,
	heading,
	rail,
}: {
	children: ReactNode;
	heading?: ReactNode;
	rail?: ReactNode;
}) {
	return (
		<AppShellFrame header={<SiteHeader />} heading={heading} rail={rail}>
			{children}
		</AppShellFrame>
	);
}
