import type {
	Article,
	ArticleInput,
} from "@/features/articles/types/article.types";
import { uploadImage } from "@/features/media";
import type { MediaUploadStage } from "@/features/media/types/media.types";

import {
	createArticle,
	deleteArticleCover,
	publishArticle,
	saveArticleCover,
	updateArticle,
} from "./articles";

export type CoverChange =
	| { type: "unchanged" }
	| { type: "upload"; file: File }
	| { type: "remove" };

type SaveArticleDependencies = {
	create: typeof createArticle;
	update: typeof updateArticle;
	upload: typeof uploadImage;
	confirmCover: typeof saveArticleCover;
	removeCover: typeof deleteArticleCover;
	publish: typeof publishArticle;
};

const defaultDependencies: SaveArticleDependencies = {
	create: createArticle,
	update: updateArticle,
	upload: uploadImage,
	confirmCover: saveArticleCover,
	removeCover: deleteArticleCover,
	publish: publishArticle,
};

export class ArticleCoverSaveError extends Error {
	constructor(
		public readonly article: Article,
		public readonly wasCreated: boolean,
		options?: ErrorOptions,
	) {
		super(
			wasCreated && article.status === "published"
				? "O artigo foi publicado, mas a capa não foi enviada. Tente salvar novamente."
				: "O artigo foi salvo, mas não foi possível concluir a alteração da capa. Tente novamente.",
			options,
		);
		this.name = "ArticleCoverSaveError";
	}
}

export async function saveArticleWithCover(
	input: {
		articleId: string | null;
		article: ArticleInput;
		intent: "draft" | "publish";
		cover: CoverChange;
		onArticlePersisted?: (article: Article) => void;
		onStage?: (stage: MediaUploadStage) => void;
	},
	dependencies: SaveArticleDependencies = defaultDependencies,
): Promise<Article> {
	const wasCreated = input.articleId === null;
	let article =
		input.articleId === null
			? await dependencies.create({
					...input.article,
					status: input.intent === "publish" ? "published" : "draft",
				})
			: await dependencies.update(input.articleId, input.article);

	input.onArticlePersisted?.(article);

	try {
		if (input.cover.type === "upload") {
			const objectKey = await dependencies.upload(
				input.cover.file,
				"article-cover",
				input.onStage,
			);
			input.onStage?.("saving");
			article = await dependencies.confirmCover(article.id, objectKey);
		} else if (input.cover.type === "remove") {
			input.onStage?.("saving");
			article = await dependencies.removeCover(article.id);
		}
	} catch (cause) {
		throw new ArticleCoverSaveError(article, wasCreated, { cause });
	}

	if (input.intent === "publish" && article.status === "draft") {
		article = await dependencies.publish(article.id);
	}

	return article;
}
