import { displayFont } from "@/app/fonts";

import { type Article, FeedArticleCard } from "./feed-article-card";
import { FeedFilterTabs } from "./feed-filter-tabs";

const RECOMMENDED_ARTICLES: Article[] = [
	{
		slug: "como-pequenas-escolhas-moldam-produtos-melhores",
		category: "DESIGN & PRODUTO",
		title: "Como pequenas escolhas moldam produtos melhores",
		summary:
			"Uma leitura prática sobre pesquisa, clareza e decisões de design que permanecem úteis com o tempo.",
		author: "Marina Costa",
		readTimeMinutes: 6,
	},
	{
		slug: "o-trabalho-profundo-ainda-cabe-na-rotina",
		category: "CARREIRA",
		title: "O trabalho profundo ainda cabe na rotina?",
		summary:
			"Estratégias realistas para proteger atenção e criar espaço para projetos que exigem concentração.",
		author: "Rafael Nunes",
		readTimeMinutes: 8,
	},
];

export function FeedRecommendations() {
	return (
		<section className="flex w-220 flex-col gap-5">
			<h1
				className={`${displayFont.className} font-bold text-[#111111] text-[40px] leading-11`}
			>
				Para você
			</h1>

			<FeedFilterTabs />

			{RECOMMENDED_ARTICLES.map((article) => (
				<FeedArticleCard key={article.slug} article={article} />
			))}
		</section>
	);
}
