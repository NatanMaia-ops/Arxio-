"use client";

import type { ReactNode } from "react";

const DEMO_ARTICLES = [
	{
		title: "Reprodutibilidade em experimentos de aprendizado de máquina",
		meta: "Marina Duarte · 12 min de leitura",
	},
	{
		title: "O que muda quando a revisão por pares acontece em público",
		meta: "Caio Ribeiro · 8 min de leitura",
	},
	{
		title: "Notas sobre arquitetura hexagonal em times pequenos",
		meta: "Ana Beatriz Lopes · 6 min de leitura",
	},
	{
		title: "Modelos de difusão explicados sem álgebra pesada",
		meta: "Rafael Nunes · 15 min de leitura",
	},
	{
		title: "Como estruturar um artigo de pesquisa aplicada",
		meta: "Helena Prado · 9 min de leitura",
	},
] as const;

type PreviewFrameProps = {
	maxWidth: number | null;
	children: ReactNode;
};

export function PreviewFrame({ maxWidth, children }: PreviewFrameProps) {
	return (
		<div className="ax-canvas rounded-3xl border border-ax-line/60 p-3 sm:p-5">
			<div
				className="mx-auto w-full transition-[max-width] duration-300 ease-out motion-reduce:transition-none"
				style={{ maxWidth: maxWidth ? `${maxWidth}px` : "100%" }}
			>
				<div className="relative h-115 overflow-y-auto overscroll-contain rounded-2xl bg-ax-surface shadow-ax-float">
					{children}

					<PreviewContent />
				</div>
			</div>
		</div>
	);
}

export function PreviewSurface({ maxWidth, children }: PreviewFrameProps) {
	return (
		<div className="ax-canvas rounded-3xl border border-ax-line/60 p-3 sm:p-6">
			<div
				className="mx-auto w-full transition-[max-width] duration-300 ease-out motion-reduce:transition-none"
				style={{ maxWidth: maxWidth ? `${maxWidth}px` : "100%" }}
			>
				{children}
			</div>
		</div>
	);
}

function PreviewContent() {
	return (
		<main className="px-5 pt-6 pb-12 sm:px-8">
			<h2 className="font-home-display font-light text-[28px] text-ax-ink leading-8">
				Artigos
			</h2>

			<p className="mt-2 text-ax-ink-soft text-sm leading-5">
				Conteúdo de demonstração para avaliar o comportamento do header em
				rolagem.
			</p>

			<ul className="mt-6 flex flex-col">
				{DEMO_ARTICLES.map((article) => (
					<li
						key={article.title}
						className="border-ax-line border-b py-4 last:border-b-0"
					>
						<h3 className="font-home-display font-normal text-[19px] text-ax-ink leading-6">
							{article.title}
						</h3>
						<p className="mt-1.5 text-ax-meta text-xs">{article.meta}</p>
					</li>
				))}
			</ul>
		</main>
	);
}
