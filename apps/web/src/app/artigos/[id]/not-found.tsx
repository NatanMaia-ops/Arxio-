import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";

export default function ArticleNotFound() {
	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto flex max-w-180 flex-col items-start gap-4 px-6 pt-30 pb-24">
				<h1 className="font-bold font-home-display text-[40px] text-ax-ink leading-11">
					Artigo não encontrado
				</h1>
				<p className="text-ax-ink-soft text-base leading-6">
					O artigo que você procura não existe ou foi removido pelo autor.
				</p>
				<Link
					href={{ pathname: "/artigos" }}
					className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Ver todos os artigos
				</Link>
			</main>
		</div>
	);
}
