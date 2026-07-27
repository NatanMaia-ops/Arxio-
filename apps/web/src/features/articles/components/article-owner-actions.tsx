"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getSession } from "@/features/auth/services/get-session";

import { DeleteArticleButton } from "./delete-article-button";

export function ArticleOwnerActions({
	articleId,
	authorId,
}: {
	articleId: string;
	authorId: string;
}) {
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (isActive) setIsOwner(session?.user.id === authorId);
			})
			.catch(() => {
				if (isActive) setIsOwner(false);
			});

		return () => {
			isActive = false;
		};
	}, [authorId]);

	if (!isOwner) return null;

	return (
		<div className="flex shrink-0 items-center gap-2">
			<Link
				href={`/artigos/${articleId}/editar` as Route}
				className="rounded-full border border-ax-line px-4 py-2 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2"
			>
				Editar
			</Link>

			<DeleteArticleButton articleId={articleId} />
		</div>
	);
}
