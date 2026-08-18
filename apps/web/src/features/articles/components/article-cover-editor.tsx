"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { CoverFit } from "@/features/articles/types/article.types";
import { MEDIA_ACCEPT, useImageSelection } from "@/features/media";

export function ArticleCoverEditor({
	initialUrl,
	isRemoved,
	disabled,
	fit,
	onFitChange,
	onFileChange,
	onRemove,
}: {
	initialUrl: string | null;
	isRemoved: boolean;
	disabled: boolean;
	fit: CoverFit;
	onFitChange: (fit: CoverFit) => void;
	onFileChange: (file: File | null) => void;
	onRemove: () => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const selection = useImageSelection();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const displayedUrl = selection.previewUrl ?? (isRemoved ? null : initialUrl);

	function handleSelection(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		if (!selection.select(file)) {
			onFileChange(null);
			return;
		}
		onFileChange(file);
	}

	function handleRemove() {
		if (selection.file) {
			selection.clear();
			onFileChange(null);
			return;
		}
		setIsConfirmOpen(true);
	}

	function confirmRemove() {
		onRemove();
		setIsConfirmOpen(false);
	}

	return (
		<section className="mt-6" aria-labelledby="article-cover-title">
			<div className="mb-2 flex items-end justify-between gap-4">
				<div>
					<h2
						id="article-cover-title"
						className="font-medium text-ax-ink text-sm"
					>
						Capa do artigo{" "}
						<span className="font-normal text-ax-meta">(opcional)</span>
					</h2>
					<p id="article-cover-help" className="mt-1 text-ax-meta text-xs">
						JPEG, PNG ou WebP, até 5 MB. A imagem será enquadrada em 16:9.
					</p>
				</div>
			</div>

			<input
				ref={inputRef}
				id="article-cover-file"
				type="file"
				accept={MEDIA_ACCEPT}
				className="sr-only"
				disabled={disabled}
				aria-describedby={`article-cover-help${selection.error ? " article-cover-error" : ""}`}
				onChange={handleSelection}
			/>

			{displayedUrl ? (
				<div className="relative aspect-video overflow-hidden rounded-xl border border-ax-line bg-ax-fill">
					{/* biome-ignore lint/performance/noImgElement: a URL pode pertencer ao S3 ou ao preview local. */}
					<img
						src={displayedUrl}
						alt=""
						className={
							fit === "contain"
								? "size-full object-contain p-4 sm:p-6"
								: "size-full object-cover"
						}
					/>
					<div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-black/55 p-3">
						<label
							htmlFor="article-cover-file"
							className={`cursor-pointer rounded-full bg-white px-3.5 py-2 font-medium text-black text-xs hover:bg-white/90 ${disabled ? "pointer-events-none opacity-50" : ""}`}
						>
							Trocar
						</label>
						<button
							type="button"
							onClick={handleRemove}
							disabled={disabled}
							className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3.5 py-2 font-medium text-white text-xs hover:bg-black/80 disabled:opacity-50"
						>
							<Trash2 className="size-3.5" aria-hidden="true" /> Remover
						</button>
					</div>
				</div>
			) : (
				<label
					htmlFor="article-cover-file"
					className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-ax-line border-dashed bg-ax-fill/40 text-center transition-colors hover:bg-ax-fill ${disabled ? "pointer-events-none opacity-50" : ""}`}
				>
					<ImagePlus className="size-6 text-ax-meta" aria-hidden="true" />
					<span className="mt-2 font-medium text-ax-ink text-sm">
						Adicionar capa
					</span>
				</label>
			)}

			{displayedUrl ? (
				<fieldset className="mt-3" disabled={disabled}>
					<legend className="text-ax-meta text-xs">
						Enquadramento da capa
					</legend>
					<div className="mt-2 inline-flex rounded-full border border-ax-line bg-ax-surface p-1">
						{(
							[
								["cover", "Preencher espaço"],
								["contain", "Mostrar inteira"],
							] as const
						).map(([value, label]) => (
							<label
								key={value}
								className={`cursor-pointer ${disabled ? "pointer-events-none opacity-50" : ""}`}
							>
								<input
									type="radio"
									name="cover-fit"
									value={value}
									checked={fit === value}
									onChange={() => onFitChange(value)}
									className="peer sr-only"
								/>
								<span
									className={`block rounded-full px-3 py-1.5 font-medium text-xs transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ax-ink peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ax-surface ${
										fit === value
											? "bg-ax-ink text-ax-on-ink"
											: "text-ax-ink-soft hover:text-ax-ink"
									}`}
								>
									{label}
								</span>
							</label>
						))}
					</div>
					<p className="mt-2 text-ax-meta text-xs">
						{fit === "contain"
							? "A imagem aparecerá completa, com respiro ao redor quando necessário."
							: "A imagem ocupará todo o quadro e poderá ter as bordas recortadas."}
					</p>
				</fieldset>
			) : null}

			{selection.error ? (
				<p
					id="article-cover-error"
					role="alert"
					className="mt-2 text-destructive text-sm"
				>
					{selection.error}
				</p>
			) : null}

			<ConfirmDialog
				open={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
				title="Remover a capa?"
				description="A capa atual será removida quando você salvar o artigo."
				confirmLabel="Remover capa"
				onConfirm={confirmRemove}
			/>
		</section>
	);
}
