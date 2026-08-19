import { Hash, X } from "lucide-react";
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
		<aside className="hidden w-72 shrink-0 xl:block">
			<div className="sticky top-24 rounded-3xl bg-ax-surface p-5 shadow-ax-float">
				<div className="flex items-center gap-2">
					<Hash
						className="size-4 shrink-0 text-ax-mute"
						strokeWidth={1.75}
						aria-hidden="true"
					/>
					<h2 className="font-medium text-ax-ink text-sm tracking-[-0.01em]">
						Tópicos
					</h2>
				</div>

				<p className="mt-1.5 text-[13px] text-ax-meta leading-5">
					Filtre o feed por assunto.
				</p>

				<div className="mt-4 flex flex-wrap gap-2">
					{tags.map((tag) => {
						const isActive = tag.id === activeTagId;

						return (
							<Link
								key={tag.id}
								href={`/feed?tagId=${tag.id}` as Route}
								aria-current={isActive ? "page" : undefined}
								className={
									isActive
										? "inline-flex items-center gap-1.5 rounded-full bg-ax-ink px-3 py-1.5 font-medium text-[13px] text-ax-on-ink transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
										: "inline-flex items-center rounded-full border border-ax-line bg-ax-fill/50 px-3 py-1.5 font-medium text-[13px] text-ax-ink-soft transition-colors hover:border-ax-line-3 hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
								}
							>
								{tag.name}
								{isActive ? (
									<X className="size-3.5 shrink-0" aria-hidden="true" />
								) : null}
							</Link>
						);
					})}
				</div>

				{activeTagId ? (
					<Link
						href={{ pathname: "/feed" }}
						className="mt-4 inline-flex font-medium text-[13px] text-ax-ink-soft underline underline-offset-4 transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Limpar filtro
					</Link>
				) : null}
			</div>
		</aside>
	);
}
