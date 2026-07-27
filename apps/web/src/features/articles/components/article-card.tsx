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
			className="flex flex-col gap-4 rounded-2xl border border-ax-line bg-ax-surface p-5 transition-colors hover:border-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface sm:min-h-62 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
		>
			<div className="flex flex-1 flex-col gap-2">
				<h3 className="font-home-display font-semibold text-[22px] text-ax-ink leading-7 sm:text-[28px] sm:leading-8.5">
					{article.title}
				</h3>
				<p className="text-ax-ink-soft text-base leading-6">
					{extractExcerpt(article.content)}
				</p>
				<span className="font-medium text-[13px] text-ax-ink-soft leading-4.5">
					{authorName} · {readTimeMinutes} min de leitura
				</span>
			</div>

			<div className="order-first h-40 w-full shrink-0 rounded-lg bg-ax-fill sm:order-none sm:h-50 sm:w-60" />
		</Link>
	);
}
