import { PenLine } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderAuth } from "@/features/auth/components/header-auth";
import { SearchCommand } from "@/features/search/components/search-command";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10 border-ax-line/70 border-b bg-ax-surface/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-400 items-center gap-4 px-5 sm:h-18 sm:gap-7 sm:px-8 lg:px-10">
				<Logo />

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
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
