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
			className="flex min-h-62 items-center gap-6 rounded-2xl border border-[#e3e3e3] bg-white p-6 transition-colors hover:border-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
		>
			<div className="flex flex-1 flex-col gap-2">
				<h3 className="font-home-display font-semibold text-[#111111] text-[28px] leading-8.5">
					{article.title}
				</h3>
				<p className="text-[#616161] text-base leading-6">
					{extractExcerpt(article.content)}
				</p>
				<span className="font-medium text-[#616161] text-[13px] leading-4.5">
					{authorName} · {readTimeMinutes} min de leitura
				</span>
			</div>

			<div className="h-50 w-60 shrink-0 rounded-lg bg-[#f2f2f2]" />
		</Link>
	);
}
