import Link from "next/link";

export default function DesignSystemLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-dvh">
			<div className="mx-auto max-w-320 px-5 pb-20 sm:px-8 lg:px-12">
				<div className="flex min-h-14 items-center gap-3 text-sm">
					<Link
						href={{ pathname: "/design-system" }}
						className="rounded-md font-medium text-ax-ink-soft transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Design system
					</Link>

					<span aria-hidden="true" className="text-ax-line-3">
						/
					</span>

					<Link
						href={{ pathname: "/feed" }}
						className="rounded-md text-ax-meta transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Voltar ao produto
					</Link>
				</div>

				{children}
			</div>
		</div>
	);
}
