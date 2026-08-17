import { ArrowLeft } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import {
	estimateReadTimeMinutes,
	extractExcerpt,
} from "@/features/articles/article-content";
import { ArticleOwnerActions } from "@/features/articles/components/article-owner-actions";
import { ArticleViewer } from "@/features/articles/components/article-viewer";
import { ArticlesUnavailable } from "@/features/articles/components/articles-unavailable";
import { resolveAuthorName } from "@/features/articles/services/article-listing";
import { getArticleById } from "@/features/articles/services/articles";
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
			<div className="min-h-dvh bg-ax-surface">
				<SiteHeader />
				<main className="mx-auto max-w-180 px-6 pt-13.5 pb-24">
					<ArticlesUnavailable
						title="Não foi possível carregar o artigo"
						description="O serviço de artigos não respondeu. Tente novamente em instantes."
					/>
				</main>
			</div>
		);
	}

	if (!article) notFound();

	const authorName = await resolveAuthorName(article.authorId);
	const readTimeMinutes = estimateReadTimeMinutes(article.content);

	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto max-w-180 px-5 pt-8 pb-24 sm:px-6 sm:pt-13.5">
				<article>
					<Link
						href={{ pathname: "/feed" }}
						className="-mx-2 mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-medium text-ax-ink-soft text-sm transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						Voltar para o feed
					</Link>

					<p className="font-medium text-[13px] text-ax-ink-soft leading-4.5">
						{dateFormatter.format(article.createdAt)}
					</p>

					<h1 className="mt-3 font-bold font-home-display text-[32px] text-ax-ink leading-10 sm:text-[40px] sm:leading-12 lg:text-[48px] lg:leading-14">
						{article.title}
					</h1>

					<div className="mt-6 flex flex-col gap-4 border-ax-line border-b pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<span className="flex flex-wrap items-center gap-x-1 font-medium text-ax-ink-soft text-sm leading-5">
							<Link
								href={`/perfil/${article.authorId}` as Route}
								className="rounded-sm transition-colors hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
							>
								{authorName}
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

					<div className="mt-8">
						<ArticleViewer content={article.content} />
					</div>
				</article>
			</main>
		</div>
	);
}
