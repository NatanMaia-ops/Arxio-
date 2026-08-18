"use client";

import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ArticleForm } from "@/features/articles/components/article-form";
import { getArticleById } from "@/features/articles/services/articles";
import type { Article } from "@/features/articles/types/article.types";
import { getSession } from "@/features/auth/services/get-session";

export default function EditArticlePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [article, setArticle] = useState<Article | null>(null);
	const articleId = params.id;

	useEffect(() => {
		let isActive = true;

		Promise.all([getSession(), getArticleById(articleId)])
			.then(([session, found]) => {
				if (!isActive) return;

				if (!session) {
					router.replace("/login");
					return;
				}

				if (!found) {
					router.replace("/feed" as Route);
					return;
				}

				if (found.authorId !== session.user.id) {
					router.replace(`/artigos/${articleId}` as Route);
					return;
				}

				setArticle(found);
			})
			.catch(() => {
				if (isActive) router.replace("/feed" as Route);
			});

		return () => {
			isActive = false;
		};
	}, [articleId, router]);

	if (!article) {
		return (
			<div className="min-h-dvh bg-ax-surface" role="status">
				<span className="sr-only">Carregando artigo...</span>
			</div>
		);
	}

	return (
		<ArticleForm
			mode="edit"
			articleId={article.id}
			initialTitle={article.title}
			initialContent={article.content}
			initialCoverUrl={article.coverUrl}
			initialCoverFit={article.coverFit}
		/>
	);
}
