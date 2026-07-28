"use client";

import { Heart, MessageCircle } from "lucide-react";

import type { FeedArticle } from "@/components/design-system/cards/card-data";
import {
	formatAbsoluteDate,
	formatArticleDate,
	formatShortDate,
} from "@/components/design-system/cards/card-data";
import {
	AuthorAvatar,
	CardLink,
	MetaDot,
	ReadTime,
	SaveButton,
	StatButton,
	TopicBadge,
} from "@/components/design-system/cards/ds-card-parts";

export function CardTimeline({ article }: { article: FeedArticle }) {
	const { day, month } = formatShortDate(article.publishedAt);

	return (
		<article className="@container group relative flex @2xl:gap-6 gap-4 border-ax-line border-b py-5 last:border-b-0">
			<time
				dateTime={article.publishedAt}
				title={formatAbsoluteDate(article.publishedAt)}
				className="@2xl:flex hidden w-12 shrink-0 flex-col items-center rounded-lg bg-ax-fill/60 py-2"
			>
				<span className="font-home-display font-semibold text-[20px] text-ax-ink tabular-nums leading-6">
					{day}
				</span>
				<span className="font-medium text-[11px] text-ax-meta uppercase">
					{month}
				</span>
			</time>

			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ax-meta">
					<AuthorAvatar initials={article.authorInitials} className="size-6" />

					<span className="font-medium text-ax-ink-soft">
						{article.authorName}
					</span>

					<MetaDot />

					<time
						dateTime={article.publishedAt}
						title={formatAbsoluteDate(article.publishedAt)}
						className="@2xl:hidden"
					>
						{formatArticleDate(article.publishedAt)}
					</time>
				</header>

				<h3 className="font-home-display font-semibold @2xl:text-[23px] text-[20px] text-ax-ink leading-7">
					<CardLink className="line-clamp-2 transition-colors after:rounded-lg group-hover:text-ax-ink-hover">
						{article.title}
					</CardLink>
				</h3>

				<p className="line-clamp-2 text-[15px] text-ax-body leading-6">
					{article.excerpt}
				</p>

				<footer className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-ax-meta text-xs">
					<TopicBadge>{article.topic}</TopicBadge>

					<ReadTime minutes={article.readTimeMinutes} />

					<div className="ml-auto flex items-center gap-0.5">
						<StatButton icon={Heart} label="Curtidas" value={article.likes} />
						<StatButton
							icon={MessageCircle}
							label="Comentários"
							value={article.comments}
						/>
					</div>
				</footer>
			</div>

			<SaveButton isSaved={article.isSaved} className="self-start" />
		</article>
	);
}
