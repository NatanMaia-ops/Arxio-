import { Clock3, Heart, Image as ImageIcon, MessageCircle } from "lucide-react";
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
import { formatCount } from "@/features/articles/article-stats";
import { ArticleCardProgress } from "@/features/articles/components/article-card-progress";
import {
	type ArticleEngagement,
	EMPTY_ENGAGEMENT,
} from "@/features/articles/services/article-listing";
import type {
	Article,
	AuthorSummary,
} from "@/features/articles/types/article.types";

export function ArticleCard({
	article,
	author,
	engagement = EMPTY_ENGAGEMENT,
}: {
	article: Article;
	author: AuthorSummary;
	engagement?: ArticleEngagement;
}) {
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<article className="group relative flex flex-col gap-5 rounded-3xl bg-ax-surface p-5 shadow-ax-float transition-[box-shadow] hover:shadow-ax-float-lg motion-reduce:transition-none sm:min-h-60 sm:flex-row-reverse sm:items-stretch sm:gap-6 sm:p-6">
			<ArticleCover article={article} />

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ax-meta text-meta">
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
					<h3 className="font-home-display text-ax-ink text-display-md">
						<Link
							href={`/artigos/${article.id}` as Route}
							className="line-clamp-2 transition-colors after:absolute after:inset-0 after:rounded-3xl after:content-[''] hover:text-ax-ink-hover focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ax-ink focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-ax-surface"
						>
							{article.title}
						</Link>
					</h3>

					<p className="line-clamp-2 text-ax-body text-body-sm">
						{extractExcerpt(article.content)}
					</p>
				</div>

				<footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-ax-line border-t pt-4 text-ax-meta text-meta">
					<span className="flex items-center gap-1.5">
						<Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
						{readTimeMinutes} min de leitura
					</span>

					<ArticleCardProgress articleId={article.id} />

					<div className="ml-auto flex items-center gap-4">
						<span className="flex items-center gap-1.5">
							<Heart className="size-4 shrink-0" aria-hidden="true" />
							<span className="tabular-nums">
								{formatCount(engagement.likes)}
							</span>
							<span className="sr-only">
								{engagement.likes === 1 ? "curtida" : "curtidas"}
							</span>
						</span>

						<span className="flex items-center gap-1.5">
							<MessageCircle className="size-4 shrink-0" aria-hidden="true" />
							<span className="tabular-nums">
								{formatCount(engagement.comments)}
							</span>
							<span className="sr-only">
								{engagement.comments === 1 ? "comentário" : "comentários"}
							</span>
						</span>
					</div>
				</footer>
			</div>
		</article>
	);
}

function ArticleCover({ article }: { article: Article }) {
	const shape =
		"aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-ax-fill sm:aspect-auto sm:h-auto sm:w-64 lg:w-80";

	if (!article.coverUrl) {
		return (
			<div
				aria-hidden="true"
				className={`${shape} flex items-center justify-center bg-gradient-to-br from-ax-fill via-ax-fill-hover to-ax-accent/15`}
			>
				<ImageIcon className="size-7 text-ax-line-3" />
			</div>
		);
	}

	return (
		<div className={shape}>
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
	);
}
