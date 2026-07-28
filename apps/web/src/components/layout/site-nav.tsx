"use client";

import { cn } from "@arxio/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
	{ href: "/feed", label: "Feed", section: ["/feed", "/artigos"] },
] as const;

export function SiteNav() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegação principal"
			className="flex shrink-0 items-center gap-6 font-medium text-sm"
		>
			{NAV_ITEMS.map((item) => {
				const isActive = item.section.some(
					(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
				);

				return (
					<Link
						key={item.href}
						href={{ pathname: item.href }}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"flex min-h-11 items-center rounded-md px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
							isActive
								? "text-ax-ink underline decoration-2 underline-offset-8"
								: "text-ax-ink-soft hover:text-ax-ink",
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
