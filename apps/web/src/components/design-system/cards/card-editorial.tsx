"use client";

import { Heart, MessageCircle } from "lucide-react";

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
	ReadTime,
	SaveButton,
	StatButton,
	TopicBadge,
} from "@/components/design-system/cards/ds-card-parts";

export function CardEditorial({ article }: { article: FeedArticle }) {
	return (
		<article className="@container group relative flex @2xl:flex-row-reverse flex-col @2xl:items-stretch @2xl:gap-5 gap-4 rounded-2xl border border-ax-line bg-ax-surface @2xl:p-5 p-4 transition-colors hover:border-ax-line-3">
			<CoverPlaceholder
				tone={article.coverTone}
				className="@2xl:aspect-auto aspect-16/9 @2xl:h-auto @2xl:w-56 @4xl:w-64 w-full shrink-0 rounded-xl"
			/>

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ax-meta">
					<AuthorAvatar initials={article.authorInitials} />

					<span className="font-medium text-ax-ink-soft">
						{article.authorName}
					</span>

					<MetaDot />

					<time
						dateTime={article.publishedAt}
						title={formatAbsoluteDate(article.publishedAt)}
					>
						{formatArticleDate(article.publishedAt)}
					</time>

					<TopicBadge className="ml-auto">{article.topic}</TopicBadge>
				</header>

				<div className="flex flex-col gap-2">
					<h3 className="font-home-display font-semibold @2xl:text-[25px] text-[21px] text-ax-ink @2xl:leading-8 leading-7">
						<CardLink className="line-clamp-2 transition-colors group-hover:text-ax-ink-hover">
							{article.title}
						</CardLink>
					</h3>

					<p className="line-clamp-2 text-[15px] text-ax-body leading-6">
						{article.excerpt}
					</p>
				</div>

				<footer className="mt-auto flex items-center gap-3 border-ax-line border-t pt-3 text-ax-meta text-xs">
					<ReadTime minutes={article.readTimeMinutes} />

					{article.progress ? (
						<span className="@2xl:flex hidden items-center gap-2">
							<MetaDot />
							<span
								aria-hidden="true"
								className="h-1 w-16 overflow-hidden rounded-full bg-ax-fill-hover"
							>
								<span
									className="block h-full rounded-full bg-ax-ink"
									style={{ width: `${Math.round(article.progress * 100)}%` }}
								/>
							</span>
							{Math.round(article.progress * 100)}% lido
						</span>
					) : null}

					<div className="ml-auto flex items-center gap-0.5">
						<StatButton icon={Heart} label="Curtidas" value={article.likes} />
						<StatButton
							icon={MessageCircle}
							label="Comentários"
							value={article.comments}
						/>
						<SaveButton isSaved={article.isSaved} />
					</div>
				</footer>
			</div>
		</article>
	);
}
