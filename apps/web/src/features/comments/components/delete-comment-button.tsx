"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/features/articles/components/confirm-dialog";

export function DeleteCommentButton({
	onConfirm,
}: {
	onConfirm: () => Promise<void>;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleConfirm() {
		setIsDeleting(true);

		try {
			await onConfirm();
			setIsOpen(false);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="cursor-pointer font-medium hover:text-ax-ink"
			>
				Excluir
			</button>

			<ConfirmDialog
				open={isOpen}
				onOpenChange={setIsOpen}
				title="Excluir este comentário?"
				description="Essa ação não pode ser desfeita. Respostas a este comentário também serão removidas."
				confirmLabel="Excluir"
				isConfirming={isDeleting}
				onConfirm={handleConfirm}
			/>
		</>
	);
}
