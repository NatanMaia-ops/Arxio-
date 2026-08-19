"use client";

export default function ArticlesError({ reset }: { reset: () => void }) {
	return (
		<div className="min-h-dvh">
			<main className="mx-auto flex max-w-180 flex-col items-start gap-4 px-5 pt-20 sm:px-6 sm:pt-30">
				<h1 className="font-home-display text-ax-ink text-display-lg">
					Não foi possível carregar o feed
				</h1>
				<p className="text-ax-ink-soft text-base leading-6">
					O serviço de artigos não respondeu. Tente novamente em instantes.
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Tentar novamente
				</button>
			</main>
		</div>
	);
}
