import { PenLine } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderAuth } from "@/features/auth/components/header-auth";
import { SearchCommand } from "@/features/search/components/search-command";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10">
			<div className="flex h-20 items-center gap-4 px-6 sm:h-24 sm:gap-7 sm:px-10 lg:px-12">
				<span className="lg:hidden">
					<Logo />
				</span>

				<div className="ml-auto flex items-center gap-1.5 rounded-full bg-ax-surface/85 p-1.5 shadow-ax-float backdrop-blur-md sm:gap-2">
					<SearchCommand />

					<ThemeToggle />

					<Link
						href={{ pathname: "/escrever" }}
						aria-label="Escrever artigo"
						className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-ax-ink px-3 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface lg:px-4.5"
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
