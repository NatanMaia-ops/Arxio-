"use client";

export default function ArticlesError({ reset }: { reset: () => void }) {
	return (
		<div className="min-h-dvh bg-white">
			<main className="mx-auto flex max-w-180 flex-col items-start gap-4 px-20 pt-30">
				<h1 className="font-bold font-home-display text-[#111111] text-[40px] leading-11">
					Não foi possível carregar os artigos
				</h1>
				<p className="text-[#616161] text-base leading-6">
					O serviço de artigos não respondeu. Tente novamente em instantes.
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-full bg-black px-4.5 py-2.5 font-medium text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
				>
					Tentar novamente
				</button>
			</main>
		</div>
	);
}
