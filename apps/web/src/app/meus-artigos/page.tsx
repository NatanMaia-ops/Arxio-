import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import {
	MyArticles,
	NewArticleLink,
} from "@/features/articles/components/my-articles";
import { RequireAuth } from "@/features/articles/components/require-auth";

export const metadata: Metadata = {
	title: "Meus artigos | Arxio",
	description: "Gerencie seus rascunhos e artigos publicados.",
};

export default function MyArticlesPage() {
	return (
		<RequireAuth>
			<div className="min-h-dvh bg-ax-surface">
				<SiteHeader />
				<main className="mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
					<header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-ax-line border-b pb-6">
						<div>
							<h1 className="font-bold font-home-display text-[32px] text-ax-ink leading-9 sm:text-[40px] sm:leading-11">
								Meus artigos
							</h1>
							<p className="mt-2 text-ax-body">
								Continue seus rascunhos ou gerencie o que já publicou.
							</p>
						</div>
						<NewArticleLink />
					</header>

					<MyArticles />
				</main>
			</div>
		</RequireAuth>
	);
}
