"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteArticle } from "@/features/articles/services/articles";

import { ConfirmDialog } from "./confirm-dialog";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete() {
		setIsDeleting(true);

		try {
			await deleteArticle(articleId);
			setIsOpen(false);
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
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="inline-flex min-h-11 items-center rounded-full border border-ax-line px-4 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
			>
				Excluir
			</button>

			<ConfirmDialog
				open={isOpen}
				onOpenChange={setIsOpen}
				title="Excluir este artigo?"
				description="Essa ação não pode ser desfeita. O artigo deixa de aparecer para todos os leitores."
				confirmLabel="Excluir"
				isConfirming={isDeleting}
				onConfirm={handleDelete}
			/>
		</>
	);
}
