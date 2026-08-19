"use client";

import { Clock3, FilePenLine, Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { extractExcerpt } from "@/features/articles/article-content";
import { formatAbsoluteDate } from "@/features/articles/article-date";
import { getMyArticles } from "@/features/articles/services/articles";
import type { Article } from "@/features/articles/types/article.types";

export function MyArticles() {
	const [articles, setArticles] = useState<Article[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		getMyArticles()
			.then((items) => {
				if (!isActive) return;
				setArticles(
					[...items].sort(
						(first, second) =>
							second.updatedAt.getTime() - first.updatedAt.getTime(),
					),
				);
			})
			.catch((cause) => {
				if (!isActive) return;
				setError(
					cause instanceof Error
						? cause.message
						: "Não foi possível carregar seus artigos",
				);
			});

		return () => {
			isActive = false;
		};
	}, []);

	if (error) {
		return (
			<div className="rounded-3xl bg-ax-surface p-6 shadow-ax-float">
				<p role="alert" className="text-ax-ink-soft text-sm">
					{error}
				</p>
			</div>
		);
	}

	if (!articles) {
		return (
			<div className="py-16 text-center text-ax-meta text-sm" role="status">
				Carregando seus artigos...
			</div>
		);
	}

	if (articles.length === 0) {
		return (
			<div className="flex flex-col items-start gap-4 rounded-3xl border border-ax-line border-dashed bg-ax-surface/70 p-10">
				<p className="text-ax-ink-soft">
					Você ainda não começou nenhum artigo.
				</p>
				<NewArticleLink />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{articles.map((article) => (
				<article
					key={article.id}
					className="rounded-3xl bg-ax-surface p-6 shadow-ax-float"
				>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
								<span
									className={
										article.status === "draft"
											? "rounded-full bg-ax-fill px-2.5 py-1 font-medium text-ax-ink-soft"
											: "rounded-full bg-ax-ink px-2.5 py-1 font-medium text-ax-on-ink"
									}
								>
									{article.status === "draft" ? "Rascunho" : "Publicado"}
								</span>
								<span className="flex items-center gap-1 text-ax-meta">
									<Clock3 className="size-3.5" aria-hidden="true" />
									Atualizado em {formatAbsoluteDate(article.updatedAt)}
								</span>
							</div>

							<h2 className="font-home-display font-normal text-[25px] text-ax-ink">
								{article.title}
							</h2>
							<p className="mt-2 line-clamp-2 text-ax-body text-sm leading-6">
								{extractExcerpt(article.content)}
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-2">
							{article.status === "published" ? (
								<Link
									href={`/artigos/${article.id}` as Route}
									className="rounded-full border border-ax-line px-4 py-2 font-medium text-ax-ink-soft text-sm hover:border-ax-ink hover:text-ax-ink"
								>
									Ver artigo
								</Link>
							) : null}
							<Link
								href={`/artigos/${article.id}/editar` as Route}
								className="inline-flex items-center gap-2 rounded-full bg-ax-ink px-4 py-2 font-medium text-ax-on-ink text-sm hover:opacity-85"
							>
								<FilePenLine className="size-4" aria-hidden="true" />
								Editar
							</Link>
						</div>
					</div>
				</article>
			))}
		</div>
	);
}

export function NewArticleLink() {
	return (
		<Link
			href={"/escrever" as Route}
			className="inline-flex items-center gap-2 rounded-full bg-ax-ink px-4 py-2.5 font-medium text-ax-on-ink text-sm hover:opacity-85"
		>
			<Plus className="size-4" aria-hidden="true" />
			Novo artigo
		</Link>
	);
}
