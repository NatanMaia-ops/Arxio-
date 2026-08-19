import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { OwnArticleList } from "@/features/articles/components/own-article-list";
import { RequireAuth } from "@/features/articles/components/require-auth";

export const metadata: Metadata = {
	title: "Meus artigos | Arxio",
	description: "Os artigos que você publicou na Arxio.",
};

export default function OwnArticlesPage() {
	return (
		<RequireAuth>
			<div className="min-h-dvh">
				<SiteHeader />

				<div className="mx-auto flex w-full max-w-400 gap-8 px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
					<SiteSidebar />

					<main className="w-full min-w-0">
						<header className="flex flex-col gap-3 border-ax-line border-b pb-6">
							<h1 className="font-home-display font-light text-[32px] text-ax-ink leading-9 sm:text-[40px] sm:leading-11">
								Meus artigos
							</h1>

							<p className="max-w-160 text-ax-body text-base leading-6">
								Tudo o que você já publicou na Arxio, do mais recente para o
								mais antigo.
							</p>
						</header>

						<section className="mt-6">
							<OwnArticleList />
						</section>
					</main>
				</div>
			</div>
		</RequireAuth>
	);
}
