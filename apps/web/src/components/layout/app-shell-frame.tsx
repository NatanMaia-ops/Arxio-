"use client";

import { cn } from "@arxio/ui/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { SiteSidebar } from "@/components/layout/site-sidebar";
import { useAccount } from "@/features/auth/account-context";

const STORAGE_KEY = "arxio:sidebar-open";

function readStoredPreference(): boolean {
	try {
		return window.localStorage.getItem(STORAGE_KEY) !== "false";
	} catch {
		return true;
	}
}

export function AppShellFrame({
	header,
	heading,
	rail,
	children,
}: {
	header: ReactNode;
	heading?: ReactNode;
	rail?: ReactNode;
	children: ReactNode;
}) {
	const account = useAccount();
	const [isOpen, setIsOpen] = useState(true);

	const hasSidebar = account.status === "authenticated";

	useEffect(() => {
		setIsOpen(readStoredPreference());
	}, []);

	function toggle() {
		const next = !isOpen;

		setIsOpen(next);

		try {
			window.localStorage.setItem(STORAGE_KEY, String(next));
		} catch {
			// Sem localStorage a preferencia so vale para esta navegacao.
		}
	}

	return (
		<div className="min-h-dvh">
			{hasSidebar ? <SiteSidebar isOpen={isOpen} onToggle={toggle} /> : null}

			<div
				className={cn(
					"transition-[padding] duration-300 ease-out motion-reduce:transition-none",
					hasSidebar && (isOpen ? "lg:pl-64" : "lg:pl-19"),
				)}
			>
				{header}

				<div className="px-6 pt-8 pb-16 sm:px-10 sm:pt-12 lg:px-12">
					{heading}

					<div className="mt-6 flex gap-10">
						<main className="w-full min-w-0">{children}</main>

						{rail}
					</div>
				</div>
			</div>
		</div>
	);
}
