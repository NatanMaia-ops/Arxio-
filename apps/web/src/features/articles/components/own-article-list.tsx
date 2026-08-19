"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticlesUnavailable } from "@/features/articles/components/articles-unavailable";
import {
	type ArticleEngagement,
	listEngagement,
	sortByNewest,
} from "@/features/articles/services/article-listing";
import { getArticles } from "@/features/articles/services/articles";
import type {
	Article,
	AuthorSummary,
} from "@/features/articles/types/article.types";
import { useAccount } from "@/features/auth/account-context";

type ListState =
	| { status: "loading" }
	| { status: "unavailable" }
	| {
			status: "ready";
			articles: Article[];
			engagement: Map<string, ArticleEngagement>;
	  };

export function OwnArticleList() {
	const account = useAccount();
	const [state, setState] = useState<ListState>({ status: "loading" });

	const authorId = account.status === "authenticated" ? account.userId : null;

	useEffect(() => {
		if (!authorId) return;

		let isActive = true;

		getArticles({ authorId })
			.then(async (found) => {
				const articles = sortByNewest(found);
				const engagement = await listEngagement(
					articles.map((article) => article.id),
				);

				if (isActive) setState({ status: "ready", articles, engagement });
			})
			.catch(() => {
				if (isActive) setState({ status: "unavailable" });
			});

		return () => {
			isActive = false;
		};
	}, [authorId]);

	if (account.status === "loading" || state.status === "loading") {
		return (
			<div className="flex flex-col gap-4" role="status">
				<span className="sr-only">Carregando seus artigos...</span>
				{[0, 1, 2].map((index) => (
					<div
						key={index}
						className="h-60 animate-pulse rounded-3xl bg-ax-surface/70"
					/>
				))}
			</div>
		);
	}

	if (state.status === "unavailable") {
		return (
			<ArticlesUnavailable
				title="Não foi possível carregar seus artigos"
				description="O serviço de artigos não respondeu. Tente novamente em instantes."
			/>
		);
	}

	if (state.articles.length === 0) return <EmptyState />;
	if (account.status !== "authenticated") return null;

	const author: AuthorSummary = {
		id: account.userId,
		name: account.name ?? "Você",
		avatarUrl: account.avatarUrl,
	};

	return (
		<div className="flex flex-col gap-4">
			{state.articles.map((article) => (
				<ArticleCard
					key={article.id}
					article={article}
					author={author}
					engagement={state.engagement.get(article.id)}
				/>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-start gap-4 rounded-3xl border border-ax-line border-dashed bg-ax-surface/70 p-10">
			<h2 className="font-home-display font-normal text-[28px] text-ax-ink leading-8.5">
				Você ainda não publicou nada
			</h2>
			<p className="text-ax-ink-soft text-base leading-6">
				Seus artigos aparecem aqui assim que você publicar o primeiro.
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
