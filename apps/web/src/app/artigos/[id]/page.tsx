import { ArrowLeft } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { UserAvatar } from "@/components/user-avatar";
import {
	estimateReadTimeMinutes,
	extractExcerpt,
} from "@/features/articles/article-content";
import { ArticleOwnerActions } from "@/features/articles/components/article-owner-actions";
import { ArticleViewer } from "@/features/articles/components/article-viewer";
import { ArticlesUnavailable } from "@/features/articles/components/articles-unavailable";
import { ReadingProgressTracker } from "@/features/articles/components/reading-progress-tracker";
import { resolveAuthor } from "@/features/articles/services/article-listing";
import { getArticleById } from "@/features/articles/services/articles";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { LikeButton } from "@/features/likes/components/like-button";

export const dynamic = "force-dynamic";

type ArticlePageProps = { params: Promise<{ id: string }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

async function findArticle(id: string) {
	try {
		return { article: await getArticleById(id), isAvailable: true };
	} catch {
		return { article: null, isAvailable: false };
	}
}

export async function generateMetadata({
	params,
}: ArticlePageProps): Promise<Metadata> {
	const { id } = await params;
	const { article } = await findArticle(id);

	if (!article) return { title: "Artigo | Arxio" };

	return {
		title: `${article.title} | Arxio`,
		description: extractExcerpt(article.content, 155),
	};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
	const { id } = await params;
	const { article, isAvailable } = await findArticle(id);

	if (!isAvailable) {
		return (
			<AppShell>
				<div className="w-full max-w-180">
					<ArticlesUnavailable
						title="Não foi possível carregar o artigo"
						description="O serviço de artigos não respondeu. Tente novamente em instantes."
					/>
				</div>
			</AppShell>
		);
	}

	if (!article) notFound();

	const author = await resolveAuthor(article.authorId);
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<AppShell bleed>
			<div className="w-full">
				<article className="min-h-[calc(100dvh-5rem)] bg-ax-surface px-6 py-12 shadow-ax-float sm:min-h-[calc(100dvh-6rem)] sm:px-10 sm:py-20 lg:px-12">
					<Link
						href={{ pathname: "/feed" }}
						className="-mx-2 mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-medium text-ax-ink-soft text-sm transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						Voltar para o feed
					</Link>

					<p className="text-ax-ink-soft text-meta">
						{dateFormatter.format(article.createdAt)}
					</p>

					<h1 className="mt-3 font-home-display text-ax-ink text-display-xl">
						{article.title}
					</h1>

					<div className="mt-6 flex flex-col gap-4 border-ax-line border-b pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<span className="flex flex-wrap items-center gap-x-2 font-medium text-ax-ink-soft text-sm leading-5">
							<UserAvatar
								name={author.name}
								src={author.avatarUrl}
								className="size-9 text-xs"
							/>
							<Link
								href={`/perfil/${article.authorId}` as Route}
								className="rounded-sm font-medium text-ax-ink transition-colors hover:text-ax-ink-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
							>
								{author.name}
							</Link>
							<span aria-hidden="true">·</span>
							<span>{readTimeMinutes} min de leitura</span>
						</span>

						<div className="flex shrink-0 items-center gap-2">
							<LikeButton articleId={article.id} />

							<ArticleOwnerActions
								articleId={article.id}
								authorId={article.authorId}
							/>
						</div>
					</div>

					{article.coverUrl ? (
						<div
							className={
								article.coverFit === "contain"
									? "mt-8 flex max-h-[70vh] min-h-64 items-center justify-center overflow-hidden rounded-xl bg-ax-fill"
									: "mt-8 aspect-video overflow-hidden rounded-xl bg-ax-fill"
							}
						>
							{/* biome-ignore lint/performance/noImgElement: capas usam hosts de mídia configurados fora do build. */}
							<img
								src={article.coverUrl}
								alt=""
								className={
									article.coverFit === "contain"
										? "max-h-[70vh] max-w-full object-contain p-4 sm:p-6"
										: "size-full object-cover"
								}
							/>
						</div>
					) : null}

					<div className="mt-8">
						<ArticleViewer content={article.content} />
					</div>

					<CommentsSection articleId={article.id} />
				</article>

				<ReadingProgressTracker articleId={article.id} />
			</div>
		</AppShell>
	);
}
