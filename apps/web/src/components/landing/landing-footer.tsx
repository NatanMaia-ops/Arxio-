import Image from "next/image";

import { navLinks } from "./data";

export function LandingFooter() {
	return (
		<footer className="border-ax-line border-t">
			<div className="mx-auto flex max-w-[1216px] flex-wrap items-center justify-between gap-x-6 gap-y-5 px-5 py-8 sm:px-8 sm:py-9">
				<a
					href="#topo"
					aria-label="Arxio — início"
					className="flex items-center"
				>
					<Image
						src="/logo-arxio.png"
						alt="Arxio"
						width={2694}
						height={895}
						className="h-[22px] w-auto"
					/>
				</a>
				<nav
					aria-label="Rodapé"
					className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-7"
				>
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="font-home-interface text-[14px] text-ax-meta transition-colors hover:text-ax-ink"
						>
							{link.label}
						</a>
					))}
				</nav>
				<span className="font-home-interface text-[14px] text-ax-meta">
					© 2026 Arxio
				</span>
			</div>
		</footer>
	);
}
