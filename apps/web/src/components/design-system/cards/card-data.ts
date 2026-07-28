const MONTHS = [
	"jan",
	"fev",
	"mar",
	"abr",
	"mai",
	"jun",
	"jul",
	"ago",
	"set",
	"out",
	"nov",
	"dez",
] as const;

const REFERENCE_DATE = "2026-07-27T12:00:00.000Z";

export type FeedArticle = {
	id: string;
	title: string;
	excerpt: string;
	authorName: string;
	authorInitials: string;
	topic: string;
	publishedAt: string;
	readTimeMinutes: number;
	likes: number;
	comments: number;
	coverTone: "neutral" | "warm" | "cool";
	isSaved: boolean;
	progress?: number;
};

export const FEED_ARTICLES: FeedArticle[] = [
	{
		id: "reprodutibilidade",
		title: "Reprodutibilidade em experimentos de aprendizado de máquina",
		excerpt:
			"Registrar sementes aleatórias não basta. Um experimento só é reprodutível quando ambiente, dados e critério de parada cabem em um comando — e este artigo mostra como chegar lá sem reescrever o pipeline.",
		authorName: "Marina Duarte",
		authorInitials: "md",
		topic: "Pesquisa",
		publishedAt: "2026-07-26T09:30:00.000Z",
		readTimeMinutes: 12,
		likes: 184,
		comments: 23,
		coverTone: "cool",
		isSaved: false,
		progress: 0.4,
	},
	{
		id: "revisao-publica",
		title: "O que muda quando a revisão por pares acontece em público",
		excerpt:
			"Três anos de revisão aberta mudaram menos a qualidade dos artigos e mais o comportamento de quem revisa. Os pareceres ficaram mais longos, mais lentos e consideravelmente mais gentis.",
		authorName: "Caio Ribeiro",
		authorInitials: "cr",
		topic: "Comunidade",
		publishedAt: "2026-07-22T14:00:00.000Z",
		readTimeMinutes: 8,
		likes: 96,
		comments: 41,
		coverTone: "warm",
		isSaved: true,
	},
	{
		id: "arquitetura-hexagonal",
		title: "Notas sobre arquitetura hexagonal em times pequenos",
		excerpt:
			"A separação entre domínio e infraestrutura cobra um preço fixo por módulo. Em times de até quatro pessoas, esse preço só se paga em duas situações específicas.",
		authorName: "Ana Beatriz Lopes",
		authorInitials: "al",
		topic: "Engenharia",
		publishedAt: "2026-06-30T18:45:00.000Z",
		readTimeMinutes: 6,
		likes: 212,
		comments: 17,
		coverTone: "neutral",
		isSaved: false,
	},
];

export function formatAbsoluteDate(iso: string) {
	const date = new Date(iso);

	return `${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

export function formatShortDate(iso: string) {
	const date = new Date(iso);

	return {
		day: String(date.getUTCDate()),
		month: MONTHS[date.getUTCMonth()],
	};
}

export function formatArticleDate(iso: string) {
	const publishedAt = new Date(iso).getTime();
	const reference = new Date(REFERENCE_DATE).getTime();
	const hours = Math.floor((reference - publishedAt) / 3_600_000);

	if (hours < 1) return "agora há pouco";
	if (hours < 24) return `há ${hours} h`;

	const days = Math.floor(hours / 24);

	if (days === 1) return "ontem";
	if (days < 7) return `há ${days} dias`;

	return formatAbsoluteDate(iso);
}

export function formatCount(value: number) {
	if (value < 1000) return String(value);

	return `${(value / 1000).toFixed(1).replace(".0", "").replace(".", ",")} mil`;
}
