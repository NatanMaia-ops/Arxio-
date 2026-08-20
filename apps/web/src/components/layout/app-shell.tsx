import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/layout/app-shell-frame";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({
	children,
	heading,
	rail,
	bleed = false,
}: {
	children: ReactNode;
	heading?: ReactNode;
	rail?: ReactNode;
	bleed?: boolean;
}) {
	return (
		<AppShellFrame
			header={<SiteHeader />}
			heading={heading}
			rail={rail}
			bleed={bleed}
		>
			{children}
		</AppShellFrame>
	);
}
