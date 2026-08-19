import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticlesUnavailable } from "@/features/articles/components/articles-unavailable";
import {
	type ArticleWithAuthor,
	listArticlesWithAuthors,
} from "@/features/articles/services/article-listing";
import { TagRail } from "@/features/tags/components/tag-rail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Feed | Arxio",
	description: "O que a comunidade da Arxio está publicando.",
};

type FeedPageProps = {
	searchParams: Promise<{ tagId?: string }>;
};

export default async function ArticlesPage({ searchParams }: FeedPageProps) {
	const { tagId } = await searchParams;
	let articles: ArticleWithAuthor[] | null = null;

	try {
		articles = await listArticlesWithAuthors({ tagId });
	} catch {
		articles = null;
	}

	return (
		<AppShell
			rail={<TagRail activeTagId={tagId} />}
			heading={
				<header className="flex flex-col gap-3 border-ax-line border-b pb-6">
					<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
						<h1 className="font-home-display text-ax-ink text-display-lg">
							Leituras recentes
						</h1>

						{articles?.length ? (
							<span className="text-ax-meta text-meta tabular-nums">
								{articles.length}{" "}
								{articles.length === 1
									? "artigo publicado"
									: "artigos publicados"}
							</span>
						) : null}
					</div>

					<p className="max-w-160 text-ax-body text-body">
						Estudos, notas e projetos publicados por quem faz parte da
						comunidade da Arxio.
					</p>
				</header>
			}
		>
			<section className="flex flex-col gap-4">
				{articles === null && <ArticlesUnavailable />}

				{articles?.length === 0 && <EmptyState isFiltered={Boolean(tagId)} />}

				{articles?.map(({ article, author, engagement }) => (
					<ArticleCard
						key={article.id}
						article={article}
						author={author}
						engagement={engagement}
					/>
				))}
			</section>
		</AppShell>
	);
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
	if (isFiltered) {
		return (
			<div className="flex flex-col items-start gap-4 rounded-3xl border border-ax-line border-dashed bg-ax-surface/70 p-10">
				<h2 className="font-home-display text-ax-ink text-display-md">
					Nenhum artigo com esse tópico
				</h2>
				<p className="text-ax-ink-soft text-base leading-6">
					Ainda não há publicações marcadas com o tópico escolhido.
				</p>
				<Link
					href={{ pathname: "/feed" }}
					className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Ver todos os artigos
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-start gap-4 rounded-3xl border border-ax-line border-dashed bg-ax-surface/70 p-10">
			<h2 className="font-home-display text-ax-ink text-display-md">
				Nenhum artigo por aqui ainda
			</h2>
			<p className="text-ax-ink-soft text-base leading-6">
				Seja a primeira pessoa a publicar na Arxio.
			</p>
			<Link
				href={{ pathname: "/escrever" }}
				className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
			>
				Escrever artigo
			</Link>
		</div>
	);
}
