import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { SiteNav } from "@/components/layout/site-nav";
import { HeaderAuth } from "@/features/auth/components/header-auth";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10 border-[#e3e3e3] border-b bg-white">
			<div className="mx-auto flex h-18 max-w-360 items-center gap-6 px-20">
				<Logo />

				<SiteNav />

				<div className="flex flex-1 items-center justify-end gap-6">
					<Link
						href={{ pathname: "/escrever" }}
						className="flex min-h-11 shrink-0 items-center rounded-full bg-black px-4.5 font-medium text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
					>
						Escrever
					</Link>

					<HeaderAuth />
				</div>
			</div>
		</header>
	);
}
