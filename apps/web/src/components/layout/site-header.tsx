"use client";

import { cn } from "@arxio/ui/lib/utils";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAccount } from "@/features/auth/account-context";
import { UserMenu } from "@/features/auth/components/user-menu";
import { SearchCommand } from "@/features/search/components/search-command";

const SCROLL_THRESHOLD = 12;

export function SiteHeader() {
	const account = useAccount();
	const isAuthenticated = account.status === "authenticated";
	const isScrolled = useHasScrolled();

	return (
		<header className="sticky top-0 z-30">
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none fixed inset-x-0 top-0 h-20 border-ax-line/50 border-b bg-ax-canvas/75 backdrop-blur-lg transition-opacity duration-300 ease-out motion-reduce:transition-none sm:h-24",
					isScrolled ? "opacity-100" : "opacity-0",
				)}
			/>

			<div className="relative flex h-20 items-center gap-4 px-6 sm:h-24 sm:gap-7 sm:px-10 lg:px-12">
				<span className={isAuthenticated ? "lg:hidden" : undefined}>
					<Logo />
				</span>

				<div className="ml-auto flex items-center gap-1.5 rounded-full bg-ax-surface/85 p-1.5 shadow-ax-float backdrop-blur-md sm:gap-2">
					<SearchCommand />

					<ThemeToggle />

					{isAuthenticated ? (
						<>
							<Link
								href={{ pathname: "/escrever" }}
								aria-label="Escrever artigo"
								className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-ax-ink px-3 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface lg:px-4.5"
							>
								<PenLine className="size-4" aria-hidden="true" />
								<span className="hidden lg:inline">Escrever</span>
							</Link>

							<span className="lg:hidden">
								<UserMenu
									userId={account.userId}
									name={account.name}
									avatarUrl={account.avatarUrl}
								/>
							</span>
						</>
					) : null}

					{account.status === "unauthenticated" ? (
						<Link
							href={{ pathname: "/login" }}
							className="flex h-10 shrink-0 items-center rounded-full bg-ax-ink px-4.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
						>
							Entrar
						</Link>
					) : null}
				</div>
			</div>
		</header>
	);
}

function useHasScrolled(): boolean {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
		}

		handleScroll();

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return isScrolled;
}
