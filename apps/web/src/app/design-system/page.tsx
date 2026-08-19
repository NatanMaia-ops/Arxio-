import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Design system | Arxio",
	description:
		"Componentes e variações em avaliação para a interface da Arxio.",
};

const SECTIONS = [
	{
		href: "/design-system/header",
		title: "Header",
		description:
			"Três variações com logo, busca e ações de conta para escolher a direção da barra superior.",
		status: "3 variações",
	},
	{
		href: "/design-system/card",
		title: "Card do feed",
		description:
			"Três variações do item do feed com autor, tempo de leitura, conteúdo e data de publicação.",
		status: "3 variações",
	},
] as const;

export default function DesignSystemPage() {
	return (
		<main className="pt-8">
			<h1 className="font-home-display font-light text-[36px] text-ax-ink leading-11">
				Design system
			</h1>

			<p className="mt-3 max-w-160 text-ax-body text-base leading-6">
				Espaço para desenhar e comparar componentes antes de integrá-los ao
				produto. Cada seção mostra as variações lado a lado, com anatomia e o
				custo de cada escolha.
			</p>

			<ul className="mt-8 grid gap-4 sm:grid-cols-2">
				{SECTIONS.map((section) => (
					<li key={section.href}>
						<Link
							href={{ pathname: section.href }}
							className="flex h-full flex-col gap-2 rounded-3xl bg-ax-surface p-6 shadow-ax-float transition-[box-shadow] hover:shadow-ax-float-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface motion-reduce:transition-none"
						>
							<span className="font-medium text-ax-meta text-xs uppercase tracking-wide">
								{section.status}
							</span>

							<span className="font-home-display font-normal text-[22px] text-ax-ink leading-7">
								{section.title}
							</span>

							<span className="text-ax-body text-sm leading-5.5">
								{section.description}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
