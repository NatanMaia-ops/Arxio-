"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteArticle } from "@/features/articles/services/articles";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete() {
		const confirmed = window.confirm(
			"Excluir este artigo? Essa ação não pode ser desfeita.",
		);

		if (!confirmed) return;

		setIsDeleting(true);

		try {
			await deleteArticle(articleId);
			router.push("/artigos" as Route);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Não foi possível excluir o artigo",
			);
			setIsDeleting(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isDeleting}
			className="rounded-full border border-ax-line px-4 py-2 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface disabled:opacity-50"
		>
			{isDeleting ? "Excluindo..." : "Excluir"}
		</button>
	);
}
