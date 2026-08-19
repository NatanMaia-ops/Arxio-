import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
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
			<AppShell
				heading={
					<header className="flex flex-wrap items-end justify-between gap-4 border-ax-line border-b pb-6">
						<div>
							<h1 className="font-home-display text-ax-ink text-display-lg">
								Meus artigos
							</h1>
							<p className="mt-2 text-ax-body">
								Continue seus rascunhos ou gerencie o que já publicou.
							</p>
						</div>
						<NewArticleLink />
					</header>
				}
			>
				<MyArticles />
			</AppShell>
		</RequireAuth>
	);
}
