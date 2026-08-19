import type { Route } from "next";
import Link from "next/link";

import { getTags } from "@/features/tags/services/tags";
import type { Tag } from "@/features/tags/types/tag.types";

export async function TagRail({ activeTagId }: { activeTagId?: string }) {
	let tags: Tag[] = [];

	try {
		tags = await getTags();
	} catch {
		return null;
	}

	if (tags.length === 0) return null;

	return (
		<aside className="hidden w-64 shrink-0 xl:block">
			<div className="sticky top-26 flex flex-col gap-4">
				<h2 className="px-1 font-medium text-ax-meta text-xs uppercase tracking-wide">
					Tópicos
				</h2>

				<div className="flex flex-wrap gap-2">
					{activeTagId ? (
						<Link
							href={{ pathname: "/feed" }}
							className="inline-flex items-center rounded-full bg-ax-ink px-3 py-1.5 font-medium text-ax-on-ink text-xs transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
						>
							Limpar filtro
						</Link>
					) : null}

					{tags.map((tag) => {
						const isActive = tag.id === activeTagId;

						return (
							<Link
								key={tag.id}
								href={`/feed?tagId=${tag.id}` as Route}
								aria-current={isActive ? "page" : undefined}
								className={
									isActive
										? "inline-flex items-center rounded-full bg-ax-surface px-3 py-1.5 font-medium text-ax-ink text-xs shadow-ax-float"
										: "inline-flex items-center rounded-full px-3 py-1.5 font-medium text-ax-ink-soft text-xs transition-colors hover:bg-ax-surface/70 hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
								}
							>
								{tag.name}
							</Link>
						);
					})}
				</div>
			</div>
		</aside>
	);
}
