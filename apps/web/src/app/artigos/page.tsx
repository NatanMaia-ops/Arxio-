import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticlesUnavailable } from "@/features/articles/components/articles-unavailable";
import {
	type ArticleWithAuthor,
	listArticlesWithAuthors,
} from "@/features/articles/services/article-listing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Artigos | Arxio",
	description: "Leia os artigos publicados na Arxio.",
};

export default async function ArticlesPage() {
	let articles: ArticleWithAuthor[] | null = null;

	try {
		articles = await listArticlesWithAuthors();
	} catch {
		articles = null;
	}

	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto max-w-220 px-20 pt-13.5 pb-16">
				<section className="flex flex-col gap-5">
					<h1 className="font-bold font-home-display text-[40px] text-ax-ink leading-11">
						Artigos
					</h1>

					{articles === null && <ArticlesUnavailable />}

					{articles?.length === 0 && <EmptyState />}

					{articles?.map(({ article, authorName }) => (
						<ArticleCard
							key={article.id}
							article={article}
							authorName={authorName}
						/>
					))}
				</section>
			</main>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-start gap-4 rounded-2xl border border-ax-line border-dashed bg-ax-surface p-10">
			<h2 className="font-home-display font-semibold text-[28px] text-ax-ink leading-8.5">
				Nenhum artigo por aqui ainda
			</h2>
			<p className="text-ax-ink-soft text-base leading-6">
				Seja a primeira pessoa a publicar na Arxio.
			</p>
			<Link
				href={{ pathname: "/escrever" }}
				className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2"
			>
				Escrever artigo
			</Link>
		</div>
	);
}
