"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import {
	EMPTY_DOCUMENT,
	isEmptyContent,
} from "@/features/articles/article-content";
import {
	TITLE_MAX_LENGTH,
	TITLE_MIN_LENGTH,
} from "@/features/articles/schemas/article.schema";
import {
	createArticle,
	updateArticle,
} from "@/features/articles/services/articles";

import { ArticleEditor } from "./article-editor";

type ArticleFormProps = {
	mode: "create" | "edit";
	articleId?: string;
	initialTitle?: string;
	initialContent?: string;
};

const EMPTY_CONTENT = JSON.stringify(EMPTY_DOCUMENT);

function validate(title: string, content: string): string | null {
	const trimmedTitle = title.trim();

	if (trimmedTitle.length < TITLE_MIN_LENGTH) {
		return "O título deve ter no mínimo 3 caracteres";
	}

	if (trimmedTitle.length > TITLE_MAX_LENGTH) {
		return "O título deve ter no máximo 200 caracteres";
	}

	if (isEmptyContent(content)) {
		return "O conteúdo não pode estar vazio";
	}

	return null;
}

export function ArticleForm({
	mode,
	articleId,
	initialTitle = "",
	initialContent,
}: ArticleFormProps) {
	const router = useRouter();
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState(initialContent ?? EMPTY_CONTENT);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const submitLabel = mode === "create" ? "Publicar" : "Salvar";

	async function handleSubmit() {
		const validationError = validate(title, content);

		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setIsSaving(true);

		try {
			const input = { title: title.trim(), content };
			const article =
				mode === "edit" && articleId
					? await updateArticle(articleId, input)
					: await createArticle(input);

			router.push(`/artigos/${article.id}` as Route);
			router.refresh();
		} catch (cause) {
			toast.error(
				cause instanceof Error
					? cause.message
					: "Não foi possível salvar o artigo",
			);
			setIsSaving(false);
		}
	}

	return (
		<div className="min-h-dvh bg-white">
			<header className="sticky top-0 z-10 border-[#e3e3e3] border-b bg-white">
				<div className="mx-auto flex h-18 max-w-360 items-center justify-between gap-6 px-20">
					<Logo />

					<div className="flex items-center gap-3">
						<Link
							href={
								mode === "edit" && articleId
									? (`/artigos/${articleId}` as Route)
									: ("/artigos" as Route)
							}
							className="rounded-full border border-[#e3e3e3] px-4.5 py-2.5 font-medium text-[#616161] text-sm transition-colors hover:border-[#111111] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
						>
							Cancelar
						</Link>

						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSaving}
							className="rounded-full bg-black px-4.5 py-2.5 font-medium text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50"
						>
							{isSaving ? "Salvando..." : submitLabel}
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-180 px-6 pt-13.5 pb-24">
				<label className="sr-only" htmlFor="article-title">
					Título do artigo
				</label>
				<input
					id="article-title"
					type="text"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Título"
					maxLength={TITLE_MAX_LENGTH}
					className="w-full font-bold font-home-display text-[#111111] text-[40px] leading-12 placeholder:text-[#c6ccd3] focus:outline-none"
				/>

				<div className="mt-6">
					<ArticleEditor
						initialContent={initialContent}
						onChange={setContent}
					/>
				</div>

				{error && (
					<p role="alert" className="mt-6 text-[#616161] text-sm leading-5">
						{error}
					</p>
				)}
			</main>
		</div>
	);
}
