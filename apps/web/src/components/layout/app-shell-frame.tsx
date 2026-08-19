"use client";

import { cn } from "@arxio/ui/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { SiteSidebar } from "@/components/layout/site-sidebar";

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
	rail,
	children,
}: {
	header: ReactNode;
	rail?: ReactNode;
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		setIsOpen(readStoredPreference());
	}, []);

	function toggle() {
		setIsOpen((current) => {
			const next = !current;

			try {
				window.localStorage.setItem(STORAGE_KEY, String(next));
			} catch {
				// Sem localStorage a preferencia so vale para esta navegacao.
			}

			return next;
		});
	}

	return (
		<div className="min-h-dvh">
			<SiteSidebar isOpen={isOpen} onToggle={toggle} />

			<div
				className={cn(
					"transition-[padding] duration-300 ease-out motion-reduce:transition-none",
					isOpen ? "lg:pl-64" : "lg:pl-19",
				)}
			>
				{header}

				<div className="mx-auto flex w-full max-w-336 gap-10 px-5 pt-4 pb-16 sm:px-8 sm:pt-6 lg:px-10">
					<main className="w-full min-w-0">{children}</main>

					{rail}
				</div>
			</div>
		</div>
	);
}
