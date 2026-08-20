import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";

import { navLinks } from "./data";

export function LandingHeader() {
	return (
		<header className="fixed inset-x-0 top-0 z-[60] border-ax-line border-b bg-ax-surface/[0.86] backdrop-blur-[14px]">
			<div className="mx-auto flex h-16 max-w-[1216px] items-center justify-between gap-4 px-5 sm:gap-6 sm:px-8">
				<a
					href="#topo"
					aria-label="Arxio — início"
					className="flex shrink-0 items-center md:hidden"
				>
					<Image
						src="/logo-arxio.png"
						alt="Arxio"
						width={2694}
						height={895}
						className="h-[20px] w-auto"
					/>
				</a>

				<nav aria-label="Seções" className="hidden items-center gap-9 md:flex">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="font-home-interface text-[15px] text-ax-ink-soft transition-colors hover:text-ax-ink"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex shrink-0 items-center gap-2">
					<ThemeToggle />

					<Link
						href="/login"
						className="rounded-[10px] bg-ax-ink px-4 py-[9px] font-home-interface font-medium text-[14px] text-ax-on-ink transition-colors hover:bg-ax-ink-hover sm:px-[18px]"
					>
						Começar a escrever
					</Link>
				</div>
			</div>
		</header>
	);
}
