"use client";

import { useState } from "react";

import { COMMENT_CONTENT_MAX_LENGTH } from "@/features/comments/schemas/comment.schema";

type CommentFormProps = {
	initialValue?: string;
	placeholder?: string;
	submitLabel?: string;
	onSubmit: (content: string) => Promise<void>;
	onCancel?: () => void;
};

export function CommentForm({
	initialValue = "",
	placeholder = "Escreva um comentário...",
	submitLabel = "Comentar",
	onSubmit,
	onCancel,
}: CommentFormProps) {
	const [value, setValue] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const trimmed = value.trim();
	const canSubmit =
		trimmed.length > 0 &&
		trimmed.length <= COMMENT_CONTENT_MAX_LENGTH &&
		!isSubmitting;

	async function handleSubmit() {
		if (!canSubmit) return;

		setIsSubmitting(true);

		try {
			await onSubmit(trimmed);
			setValue("");
		} catch {
			setIsSubmitting(false);
			return;
		}

		setIsSubmitting(false);
	}

	return (
		<div className="flex flex-col gap-2">
			<textarea
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				maxLength={COMMENT_CONTENT_MAX_LENGTH}
				rows={3}
				aria-label={placeholder}
				className="w-full resize-none rounded-2xl border border-ax-line bg-ax-surface px-4 py-3 text-ax-ink text-sm leading-6 placeholder:text-ax-placeholder focus:outline-none focus:ring-2 focus:ring-ax-ink"
			/>

			<div className="flex items-center justify-between gap-2">
				<p className="text-ax-ink-soft text-xs tabular-nums">
					{value.length}/{COMMENT_CONTENT_MAX_LENGTH}
				</p>

				<div className="flex items-center justify-end gap-2">
					{onCancel ? (
						<button
							type="button"
							onClick={onCancel}
							disabled={isSubmitting}
							className="inline-flex min-h-9 items-center rounded-full px-3.5 font-medium text-ax-ink-soft text-sm transition-colors hover:text-ax-ink disabled:opacity-50"
						>
							Cancelar
						</button>
					) : null}

					<button
						type="button"
						onClick={handleSubmit}
						disabled={!canSubmit}
						className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-ax-ink px-4 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? "Enviando..." : submitLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
