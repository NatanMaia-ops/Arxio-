import { PenLine } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { SiteNav } from "@/components/layout/site-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderAuth } from "@/features/auth/components/header-auth";
import { SearchCommand } from "@/features/search/components/search-command";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10 border-ax-line border-b bg-ax-surface">
			<div className="mx-auto flex h-14 max-w-360 items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-10">
				<Logo />

				<SiteNav />

				<div className="ml-auto flex items-center gap-1 sm:gap-1.5">
					<SearchCommand />

					<ThemeToggle />

					<Link
						href={{ pathname: "/escrever" }}
						aria-label="Escrever artigo"
						className="flex h-9.5 shrink-0 items-center justify-center gap-2 rounded-lg bg-ax-ink px-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface lg:px-3.5"
					>
						<PenLine className="size-4" aria-hidden="true" />
						<span className="hidden lg:inline">Escrever</span>
					</Link>

					<HeaderAuth />
				</div>
			</div>
		</header>
	);
}
