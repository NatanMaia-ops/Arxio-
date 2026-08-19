"use client";

import { ArrowUpRight, Heart } from "lucide-react";

import type { FeedArticle } from "@/components/design-system/cards/card-data";
import {
	formatAbsoluteDate,
	formatArticleDate,
} from "@/components/design-system/cards/card-data";
import {
	AuthorAvatar,
	CardLink,
	CoverPlaceholder,
	MetaDot,
	SaveButton,
	StatButton,
	TopicBadge,
} from "@/components/design-system/cards/ds-card-parts";

export function CardMagazine({ article }: { article: FeedArticle }) {
	return (
		<article className="@container group relative flex h-full flex-col overflow-hidden rounded-3xl bg-ax-surface shadow-ax-float transition-[box-shadow] hover:shadow-ax-float-lg motion-reduce:transition-none">
			<CoverPlaceholder
				tone={article.coverTone}
				className="aspect-16/10 w-full shrink-0"
			>
				<TopicBadge className="absolute top-3 left-3 border-transparent bg-ax-surface/90 text-ax-ink backdrop-blur-sm">
					{article.topic}
				</TopicBadge>

				<span className="absolute right-3 bottom-3 rounded-full bg-ax-ink px-2.5 py-1 font-medium text-[11px] text-ax-on-ink tabular-nums">
					{article.readTimeMinutes} min de leitura
				</span>
			</CoverPlaceholder>

			<div className="flex flex-1 flex-col gap-2.5 @2xl:p-5 p-4">
				<h3 className="font-home-display font-normal @2xl:text-[22px] text-[20px] text-ax-ink leading-7">
					<CardLink className="line-clamp-2 transition-colors group-hover:text-ax-ink-hover">
						{article.title}
					</CardLink>
				</h3>

				<p className="line-clamp-3 text-[15px] text-ax-body leading-6">
					{article.excerpt}
				</p>

				<div className="mt-auto flex items-center gap-2 pt-3 text-[13px] text-ax-meta">
					<AuthorAvatar initials={article.authorInitials} className="size-6" />

					<span className="min-w-0 truncate font-medium text-ax-ink-soft">
						{article.authorName}
					</span>

					<MetaDot />

					<time
						dateTime={article.publishedAt}
						title={formatAbsoluteDate(article.publishedAt)}
						className="shrink-0"
					>
						{formatArticleDate(article.publishedAt)}
					</time>
				</div>
			</div>

			<footer className="flex items-center gap-0.5 border-ax-line border-t px-3 py-2">
				<StatButton icon={Heart} label="Curtidas" value={article.likes} />

				<SaveButton isSaved={article.isSaved} />

				<span className="ml-auto flex items-center gap-1 pr-1 font-medium text-ax-ink-soft text-xs opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
					Ler artigo
					<ArrowUpRight className="size-3.5" aria-hidden="true" />
				</span>
			</footer>
		</article>
	);
}
