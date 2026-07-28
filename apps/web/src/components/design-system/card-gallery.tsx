"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { FEED_ARTICLES } from "@/components/design-system/cards/card-data";
import { CardEditorial } from "@/components/design-system/cards/card-editorial";
import { CardMagazine } from "@/components/design-system/cards/card-magazine";
import { CardTimeline } from "@/components/design-system/cards/card-timeline";
import { PreviewSurface } from "@/components/design-system/preview-frame";
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
		name: "Variação 1 — Editorial Split",
		tagline: "Capa lateral, três blocos de informação",
		description:
			"Evolução do card atual. Divide o conteúdo em três faixas — quem escreveu e quando, o que é o artigo, e o rodapé de leitura e engajamento — separadas por espaçamento e por um divisor no rodapé. A capa vai para a direita no desktop e para o topo no mobile.",
		anatomy: [
			"Faixa 1: avatar, autor, data e selo de tópico alinhado à direita",
			"Faixa 2: título display em até 2 linhas e resumo em até 2 linhas",
			"Faixa 3: tempo de leitura à esquerda, ações à direita, com divisor",
			"Capa 16:9 com proporção reservada para não causar layout shift",
		],
		news: [
			"Capa do artigo",
			"Selo de tópico",
			"Curtidas, comentários e salvar",
			"Barra de progresso “40% lido” para continuar a leitura",
		],
		tradeoff:
			"É o card mais alto dos três: cabem poucos itens por tela em telas pequenas.",
		render: () => (
			<div className="flex flex-col gap-4">
				{FEED_ARTICLES.slice(0, 2).map((article) => (
					<CardEditorial key={article.id} article={article} />
				))}
			</div>
		),
	},
	{
		id: "timeline",
		name: "Variação 2 — Timeline Row",
		tagline: "Denso, sem capa, ordenado por data",
		description:
			"Feed de leitura rápida. Sem moldura de card: as linhas são separadas por divisores e a data ganha uma coluna própria à esquerda, o que torna a ordem cronológica legível de relance. Cabem cerca de duas vezes mais artigos por tela.",
		anatomy: [
			"Coluna de data com dia e mês, visível a partir de 672px",
			"Cabeçalho com avatar e autor; a data volta ao cabeçalho no mobile",
			"Título e resumo com line-clamp de 2 linhas cada",
			"Rodapé com tópico, tempo de leitura e engajamento",
		],
		news: [
			"Agrupamento cronológico por data",
			"Selo de tópico como filtro rápido",
			"Salvar destacado no canto superior direito",
			"Espaço livre para um indicador de “não lido”",
		],
		tradeoff:
			"Sem capa, a diferenciação visual entre artigos depende inteiramente do título.",
		render: () => (
			<div className="flex flex-col">
				{FEED_ARTICLES.map((article) => (
					<CardTimeline key={article.id} article={article} />
				))}
			</div>
		),
	},
	{
		id: "magazine",
		name: "Variação 3 — Magazine Grid",
		tagline: "Vertical, capa em destaque, para grade",
		description:
			"Card vertical pensado para grade de duas ou três colunas. A capa domina o topo e carrega dois metadados sobrepostos — tópico e tempo de leitura — liberando o corpo do card para título, resumo de três linhas e assinatura.",
		anatomy: [
			"Capa 16:10 com tópico sobreposto e pill de tempo de leitura",
			"Corpo com título em 2 linhas e resumo em 3 linhas",
			"Assinatura com avatar, autor e data, ancorada na base",
			"Rodapé separado por divisor com ações e affordance “Ler artigo”",
		],
		news: [
			"Capa como elemento principal de atenção",
			"Tempo de leitura como pill sobre a imagem",
			"Affordance “Ler artigo” revelada no hover e no foco",
			"Base pronta para destaque editorial e coleções",
		],
		tradeoff:
			"Depende de uma capa por artigo: sem imagem, o topo vira um bloco vazio.",
		render: () => (
			<div className="grid @2xl:grid-cols-2 @4xl:grid-cols-3 gap-4">
				{FEED_ARTICLES.map((article) => (
					<CardMagazine key={article.id} article={article} />
				))}
			</div>
		),
	},
];

export function CardGallery() {
	const [viewport, setViewport] = useState<ViewportId>("desktop");

	const activeViewport = resolveViewport(viewport);

	return (
		<div className="flex flex-col gap-10">
			<PreviewToolbar viewport={viewport} onViewportChange={setViewport} />

			{VARIANTS.map((variant) => (
				<section key={variant.id} className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<h2 className="font-home-display font-semibold text-[26px] text-ax-ink leading-8">
								{variant.name}
							</h2>
							<p className="text-ax-meta text-sm">{variant.tagline}</p>
						</div>

						<p className="max-w-160 text-ax-body text-sm leading-6">
							{variant.description}
						</p>
					</div>

					<PreviewSurface maxWidth={activeViewport.width}>
						<div className="@container">{variant.render()}</div>
					</PreviewSurface>

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
