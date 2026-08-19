import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";

export default function ArticleNotFound() {
	return (
		<div className="min-h-dvh">
			<SiteHeader />

			<main className="mx-auto flex max-w-180 flex-col items-start gap-4 px-5 pt-20 pb-24 sm:px-6 sm:pt-30">
				<h1 className="font-home-display font-light text-[28px] text-ax-ink leading-9 sm:text-[40px] sm:leading-11">
					Artigo não encontrado
				</h1>
				<p className="text-ax-ink-soft text-base leading-6">
					O artigo que você procura não existe ou foi removido pelo autor.
				</p>
				<Link
					href={{ pathname: "/feed" }}
					className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Voltar para o feed
				</Link>
			</main>
		</div>
	);
}
