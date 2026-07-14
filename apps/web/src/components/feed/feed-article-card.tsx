import type { Route } from "next";
import Link from "next/link";

import { displayFont } from "@/app/fonts";

export interface Article {
	slug: string;
	category: string;
	title: string;
	summary: string;
	author: string;
	readTimeMinutes: number;
}

export function FeedArticleCard({ article }: { article: Article }) {
	return (
		<Link
			href={`/artigos/${article.slug}` as Route}
			className="flex min-h-62 items-center gap-6 rounded-2xl border border-[#e3e3e3] bg-white p-6"
		>
			<div className="flex flex-1 flex-col gap-2">
				<span className="font-medium text-[#000000] text-[13px] leading-4.5">
					{article.category}
				</span>
				<h3
					className={`${displayFont.className} font-semibold text-[#111111] text-[28px] leading-8.5`}
				>
					{article.title}
				</h3>
				<p className="text-[#616161] text-base leading-6">{article.summary}</p>
				<span className="font-medium text-[#616161] text-[13px] leading-4.5">
					{article.author} · {article.readTimeMinutes} min de leitura
				</span>
			</div>

			<div className="h-50 w-60 shrink-0 rounded-lg bg-[#f2f2f2]" />
		</Link>
	);
}
