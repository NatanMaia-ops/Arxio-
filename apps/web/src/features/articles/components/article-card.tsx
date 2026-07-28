import { Clock3 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
	estimateReadTimeMinutes,
	extractExcerpt,
} from "@/features/articles/article-content";
import {
	formatAbsoluteDate,
	formatPublishedDate,
} from "@/features/articles/article-date";
import type { Article } from "@/features/articles/types/article.types";
import { getInitials } from "@/lib/initials";

export function ArticleCard({
	article,
	authorName,
}: {
	article: Article;
	authorName: string;
}) {
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<article className="group relative flex flex-col gap-4 rounded-2xl border border-ax-line bg-ax-surface p-4 transition-colors hover:border-ax-line-3 sm:flex-row-reverse sm:items-stretch sm:gap-5 sm:p-5">
			<div className="aspect-16/9 w-full shrink-0 rounded-xl bg-ax-fill sm:aspect-auto sm:h-auto sm:w-56 lg:w-72" />

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ax-meta">
					<span
						aria-hidden="true"
						className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ax-fill-hover font-semibold text-[11px] text-ax-ink uppercase"
					>
						{getInitials(authorName)}
					</span>

					<span className="font-medium text-ax-ink-soft">{authorName}</span>

					<span aria-hidden="true" className="text-ax-line-3">
						·
					</span>

					<time
						dateTime={article.createdAt.toISOString()}
						title={formatAbsoluteDate(article.createdAt)}
					>
						{formatPublishedDate(article.createdAt)}
					</time>
				</header>

				<div className="flex flex-col gap-2">
					<h3 className="font-home-display font-semibold text-[21px] text-ax-ink leading-7 sm:text-[25px] sm:leading-8">
						<Link
							href={`/artigos/${article.id}` as Route}
							className="line-clamp-2 transition-colors after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ax-ink focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-ax-surface group-hover:text-ax-ink-hover"
						>
							{article.title}
						</Link>
					</h3>

					<p className="line-clamp-2 text-[15px] text-ax-body leading-6">
						{extractExcerpt(article.content)}
					</p>
				</div>

				<footer className="mt-auto flex items-center gap-3 border-ax-line border-t pt-3 text-ax-meta text-xs">
					<span className="flex items-center gap-1.5">
						<Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
						{readTimeMinutes} min de leitura
					</span>
				</footer>
			</div>
		</article>
	);
}
