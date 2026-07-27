import type { Metadata } from "next";

import { ArticleForm } from "@/features/articles/components/article-form";
import { RequireAuth } from "@/features/articles/components/require-auth";

export const metadata: Metadata = {
	title: "Escrever | Arxio",
};

export default function WriteArticlePage() {
	return (
		<RequireAuth>
			<ArticleForm mode="create" />
		</RequireAuth>
	);
}
