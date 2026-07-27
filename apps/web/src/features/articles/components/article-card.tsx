import type { Route } from "next";
import Link from "next/link";

import {
	estimateReadTimeMinutes,
	extractExcerpt,
} from "@/features/articles/article-content";
import type { Article } from "@/features/articles/types/article.types";

export function ArticleCard({
	article,
	authorName,
}: {
	article: Article;
	authorName: string;
}) {
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<Link
			href={`/artigos/${article.id}` as Route}
			className="flex min-h-62 items-center gap-6 rounded-2xl border border-ax-line bg-ax-surface p-6 transition-colors hover:border-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2"
		>
			<div className="flex flex-1 flex-col gap-2">
				<h3 className="font-home-display font-semibold text-[28px] text-ax-ink leading-8.5">
					{article.title}
				</h3>
				<p className="text-ax-ink-soft text-base leading-6">
					{extractExcerpt(article.content)}
				</p>
				<span className="font-medium text-[13px] text-ax-ink-soft leading-4.5">
					{authorName} · {readTimeMinutes} min de leitura
				</span>
			</div>

			<div className="h-50 w-60 shrink-0 rounded-lg bg-ax-fill" />
		</Link>
	);
}
