"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/logo";
import {
	ARTICLE_CONTENT_MAX_LENGTH,
	countArticleContentCharacters,
	EMPTY_DOCUMENT,
	isEmptyContent,
} from "@/features/articles/article-content";
import {
	TITLE_MAX_LENGTH,
	TITLE_MIN_LENGTH,
} from "@/features/articles/schemas/article.schema";
import {
	ArticleCoverSaveError,
	saveArticleWithCover,
} from "@/features/articles/services/save-article";
import type { CoverFit } from "@/features/articles/types/article.types";
import type { MediaUploadStage } from "@/features/media";

import { ArticleCoverEditor } from "./article-cover-editor";
import { ArticleEditor } from "./article-editor";

type ArticleFormProps = {
	mode: "create" | "edit";
	articleId?: string;
	initialTitle?: string;
	initialContent?: string;
	initialCoverUrl?: string | null;
	initialCoverFit?: CoverFit;
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

	if (countArticleContentCharacters(content) > ARTICLE_CONTENT_MAX_LENGTH) {
		return `O conteúdo deve ter no máximo ${ARTICLE_CONTENT_MAX_LENGTH.toLocaleString("pt-BR")} caracteres`;
	}

	return null;
}

export function ArticleForm({
	mode,
	articleId,
	initialTitle = "",
	initialContent,
	initialCoverUrl = null,
	initialCoverFit = "cover",
}: ArticleFormProps) {
	const router = useRouter();
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState(initialContent ?? EMPTY_CONTENT);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [persistedArticleId, setPersistedArticleId] = useState(
		articleId ?? null,
	);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [isCoverRemoved, setIsCoverRemoved] = useState(false);
	const [coverFit, setCoverFit] = useState<CoverFit>(initialCoverFit);
	const [stage, setStage] = useState<MediaUploadStage | null>(null);

	const submitLabel =
		mode === "create" && !persistedArticleId ? "Publicar" : "Salvar";

	async function handleSubmit() {
		const validationError = validate(title, content);

		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setIsSaving(true);

		try {
			const article = await saveArticleWithCover({
				articleId: persistedArticleId,
				article: { title: title.trim(), content, coverFit },
				cover: coverFile
					? { type: "upload", file: coverFile }
					: isCoverRemoved
						? { type: "remove" }
						: { type: "unchanged" },
				onStage: setStage,
				onArticlePersisted: (savedArticle) => {
					if (persistedArticleId) return;
					setPersistedArticleId(savedArticle.id);
					window.history.replaceState(
						window.history.state,
						"",
						`/artigos/${savedArticle.id}/editar`,
					);
				},
			});

			router.push(`/artigos/${article.id}` as Route);
			router.refresh();
		} catch (cause) {
			const message =
				cause instanceof Error
					? cause.message
					: "Não foi possível salvar o artigo";
			setError(message);
			toast.error(message);
			if (cause instanceof ArticleCoverSaveError) {
				setPersistedArticleId(cause.article.id);
			}
			setStage(null);
			setIsSaving(false);
		}
	}

	return (
		<div className="min-h-dvh bg-ax-surface">
			<header className="sticky top-0 z-10 border-ax-line border-b bg-ax-surface">
				<div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-3 px-5 sm:h-18 sm:gap-6 sm:px-8 lg:px-12 xl:px-20">
					<Logo />

					<div className="flex items-center gap-3">
						<Link
							href={
								persistedArticleId
									? (`/artigos/${persistedArticleId}` as Route)
									: ("/feed" as Route)
							}
							className="rounded-full border border-ax-line px-4.5 py-2.5 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
						>
							Cancelar
						</Link>

						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSaving}
							className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface disabled:opacity-50"
						>
							{isSaving
								? stage === "preparing"
									? "Preparando..."
									: stage === "uploading"
										? "Enviando..."
										: "Salvando..."
								: submitLabel}
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-180 px-5 pt-8 pb-24 sm:px-6 sm:pt-13.5">
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
					className="w-full font-home-display font-light text-[28px] text-ax-ink leading-9 placeholder:text-ax-placeholder focus:outline-none sm:text-[40px] sm:leading-12"
				/>

				<ArticleCoverEditor
					initialUrl={initialCoverUrl}
					isRemoved={isCoverRemoved}
					disabled={isSaving}
					fit={coverFit}
					onFitChange={setCoverFit}
					onFileChange={(file) => {
						setCoverFile(file);
						if (file) setIsCoverRemoved(false);
						setError(null);
					}}
					onRemove={() => {
						setCoverFile(null);
						setIsCoverRemoved(true);
						setCoverFit("cover");
						setError(null);
					}}
				/>

				<div className="mt-8">
					<ArticleEditor
						initialContent={initialContent}
						onChange={setContent}
					/>
				</div>

				{error && (
					<p
						role="alert"
						aria-live="assertive"
						className="mt-6 rounded-lg border border-ax-line bg-ax-fill/50 px-4 py-3 text-ax-ink-soft text-sm leading-5"
					>
						{error}
					</p>
				)}
			</main>
		</div>
	);
}
