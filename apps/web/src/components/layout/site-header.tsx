import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { SiteNav } from "@/components/layout/site-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderAuth } from "@/features/auth/components/header-auth";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10 border-ax-line border-b bg-ax-surface">
			<div className="mx-auto flex h-16 max-w-360 items-center gap-3 px-5 sm:h-18 sm:gap-6 sm:px-8 lg:px-12 xl:px-20">
				<Logo />

				<SiteNav />

				<div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
					<ThemeToggle />

					<Link
						href={{ pathname: "/escrever" }}
						className="flex min-h-11 shrink-0 items-center rounded-full bg-ax-ink px-4.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Escrever
					</Link>

					<HeaderAuth />
				</div>
			</div>
		</header>
	);
}
