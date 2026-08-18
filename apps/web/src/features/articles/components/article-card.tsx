import { Clock3 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import {
	estimateReadTimeMinutes,
	extractExcerpt,
} from "@/features/articles/article-content";
import {
	formatAbsoluteDate,
	formatPublishedDate,
} from "@/features/articles/article-date";
import type {
	Article,
	AuthorSummary,
} from "@/features/articles/types/article.types";

export function ArticleCard({
	article,
	author,
}: {
	article: Article;
	author: AuthorSummary;
}) {
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<article className="relative flex flex-col gap-4 rounded-2xl border border-ax-line bg-ax-surface p-4 transition-colors hover:border-ax-line-3 sm:flex-row-reverse sm:items-stretch sm:gap-5 sm:p-5">
			{article.coverUrl ? (
				<div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-ax-fill sm:h-auto sm:w-56 lg:w-72">
					{/* biome-ignore lint/performance/noImgElement: capas usam hosts de mídia configurados fora do build. */}
					<img
						src={article.coverUrl}
						alt=""
						loading="lazy"
						className={
							article.coverFit === "contain"
								? "size-full object-contain p-4"
								: "size-full object-cover"
						}
					/>
				</div>
			) : null}

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ax-meta">
					<Link
						href={`/perfil/${author.id}` as Route}
						className="relative z-10 inline-flex min-w-0 max-w-full items-center gap-2 rounded-md font-medium text-ax-ink-soft transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<UserAvatar
							name={author.name}
							src={author.avatarUrl}
							className="size-7 text-[11px] ring-0"
						/>
						<span className="truncate">{author.name}</span>
					</Link>

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
							className="line-clamp-2 transition-colors after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-ax-ink-hover focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ax-ink focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-ax-surface"
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
