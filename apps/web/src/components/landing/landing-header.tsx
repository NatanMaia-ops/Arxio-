import Link from "next/link";

import { navLinks } from "./data";

export function LandingHeader() {
	return (
		<header className="fixed inset-x-0 top-0 z-[60] border-ax-line border-b bg-white/[0.86] backdrop-blur-[14px]">
			<div className="mx-auto flex h-16 max-w-[1216px] items-center justify-between gap-6 px-8">
				<nav aria-label="Seções" className="flex items-center gap-9">
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
				<Link
					href="/login"
					className="rounded-[10px] bg-ax-ink px-[18px] py-[9px] font-home-interface font-medium text-[14px] text-white transition-colors hover:bg-ax-ink-hover"
				>
					Começar a escrever
				</Link>
			</div>
		</header>
	);
}
