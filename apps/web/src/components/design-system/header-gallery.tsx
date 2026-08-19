"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { HeaderCapsule } from "@/components/design-system/headers/header-capsule";
import { HeaderCommand } from "@/components/design-system/headers/header-command";
import { HeaderEditorial } from "@/components/design-system/headers/header-editorial";
import { PreviewFrame } from "@/components/design-system/preview-frame";
import {
	PreviewToolbar,
	resolveViewport,
	type ViewportId,
} from "@/components/design-system/preview-toolbar";
import {
	type VariantSpec,
	VariantSpecs,
} from "@/components/design-system/variant-specs";

type Variant = VariantSpec & {
	id: string;
	name: string;
	tagline: string;
	description: string;
	render: () => ReactNode;
};

const VARIANTS: Variant[] = [
	{
		id: "editorial",
		name: "Variação 1 — Editorial Rail",
		tagline: "Busca sempre visível, uma única faixa",
		description:
			"Evolução direta do header atual. A busca ocupa o centro óptico da barra e cresce com a largura disponível, mantendo logo à esquerda e ações à direita. É a opção mais previsível para leitura contínua.",
		anatomy: [
			"Altura 60px em telas estreitas e 72px a partir de 672px",
			"Nav com indicador inferior de 2px na seção ativa",
			"Campo de busca pill com atalho “/” exibido em kbd",
			"Ações: notificações com badge, salvos, tema, CTA e avatar",
		],
		news: [
			"Sino de notificações com contador",
			"Marcador de artigos salvos",
			"Avatar com iniciais e menu de conta",
			"Atalho de teclado “/” para focar a busca",
		],
		tradeoff:
			"Ocupa a maior altura das três e concentra muitos alvos na direita em telas médias.",
		render: () => <HeaderEditorial />,
	},
	{
		id: "command",
		name: "Variação 2 — Command Deck",
		tagline: "Duas faixas, busca em command palette",
		description:
			"Faixa superior compacta com o gatilho de busca e faixa inferior com tópicos roláveis. Ao rolar, a faixa de tópicos recolhe e o header vira uma barra de 56px. A busca abre em overlay com navegação por teclado.",
		anatomy: [
			"Faixa 1 fixa em 56px, faixa 2 de tópicos recolhível",
			"Recolhimento por IntersectionObserver, sem listener de scroll",
			"Gatilho de busca com ⌘K / Ctrl+K e foco devolvido ao fechar",
			"Overlay com combobox, listbox e navegação por setas",
		],
		news: [
			"Command palette com recentes e sugestões",
			"Chips de tópicos com estado ativo",
			"Botão de filtros avançados",
			"Notificações com contador de dois dígitos",
		],
		tradeoff:
			"A busca fica a um clique de distância, o que reduz descoberta para quem não conhece o padrão ⌘K.",
		render: () => <HeaderCommand />,
	},
	{
		id: "capsule",
		name: "Variação 3 — Floating Capsule",
		tagline: "Cápsula flutuante com superfície translúcida",
		description:
			"Rompe com o padrão de barra colada ao topo. O header vira uma cápsula com blur e sombra que flutua sobre o conteúdo, dando ao produto um tom mais contemporâneo sem perder a densidade tipográfica.",
		anatomy: [
			"Cápsula centralizada, 56px em mobile e 64px acima de 672px",
			"Superfície ax-surface/80 com backdrop-blur e borda ax-line",
			"Nav em pills com fundo ax-fill no item ativo",
			"Busca em mobile abre uma segunda cápsula logo abaixo",
		],
		news: [
			"Indicador de presença no avatar",
			"Selo de busca assistida por IA no campo",
			"CTA de escrever reduzido a ícone em telas médias",
			"Sombra de elevação como token de destaque",
		],
		tradeoff:
			"O blur custa mais em GPU e a cápsula reduz a largura útil de conteúdo em telas muito estreitas.",
		render: () => <HeaderCapsule />,
	},
];

export function HeaderGallery() {
	const [viewport, setViewport] = useState<ViewportId>("desktop");

	const activeViewport = resolveViewport(viewport);

	return (
		<div className="flex flex-col gap-10">
			<PreviewToolbar viewport={viewport} onViewportChange={setViewport} />

			{VARIANTS.map((variant) => (
				<section key={variant.id} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<h2 className="font-home-display font-normal text-[26px] text-ax-ink leading-8">
								{variant.name}
							</h2>
							<p className="text-ax-meta text-sm">{variant.tagline}</p>
						</div>

						<p className="max-w-160 text-ax-body text-sm leading-6">
							{variant.description}
						</p>
					</div>

					<PreviewFrame maxWidth={activeViewport.width}>
						{variant.render()}
					</PreviewFrame>

					<VariantSpecs
						anatomy={variant.anatomy}
						news={variant.news}
						tradeoff={variant.tradeoff}
					/>
				</section>
			))}
		</div>
	);
}
