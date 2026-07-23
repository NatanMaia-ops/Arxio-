import type { CSSProperties } from "react";

export const navLinks = [
	{ href: "#como-funciona", label: "Como funciona" },
	{ href: "#artigos", label: "Artigos" },
	{ href: "#comunidade", label: "Comunidade" },
] as const;

export const steps = [
	{ title: "Escreva", description: "Um editor limpo, só você e o texto." },
	{
		title: "Publique",
		description: "Um clique e está no feed da comunidade.",
	},
	{ title: "Seja lido", description: "Aplausos, comentários, seguidores." },
	{ title: "Evolua", description: "Pontos viram níveis e reputação." },
] as const;

export const secondaryArticles = [
	{
		category: "Carreira",
		title: "Portfólio não é só código: escreva sobre o que você constrói",
		meta: "João Pedro · 7 min",
	},
	{
		category: "Ciência",
		title: "O método de Feynman aplicado a artigos curtos",
		meta: "Laura Costa · 3 min",
	},
	{
		category: "Escrita",
		title: "Anotações de aula viram artigos melhores do que você imagina",
		meta: "Beatriz Nunes · 4 min",
	},
] as const;

export const trending = [
	{
		title: "REST ou GraphQL? O guia que eu queria ter lido",
		author: "Caio Martins",
	},
	{ title: "Escrever é a melhor forma de estudar", author: "Ana Ribeiro" },
	{ title: "Como escrevi meu primeiro artigo técnico", author: "Rafael Lima" },
] as const;

export const writers = [
	{
		rank: "1",
		name: "Marina Duarte",
		tag: "Escreve sobre tecnologia e carreira",
		points: "1.284 pts",
		sub: "14 artigos · 9 dias de sequência",
	},
	{
		rank: "2",
		name: "Rafael Lima",
		tag: "Engenharia de software no dia a dia",
		points: "1.107 pts",
		sub: "11 artigos · 12 dias de sequência",
	},
	{
		rank: "3",
		name: "Beatriz Nunes",
		tag: "Estudos, leitura e escrita",
		points: "968 pts",
		sub: "9 artigos · 6 dias de sequência",
	},
	{
		rank: "4",
		name: "Caio Martins",
		tag: "APIs, dados e tutoriais práticos",
		points: "842 pts",
		sub: "8 artigos · 4 dias de sequência",
	},
] as const;

export function reveal(index: number): {
	"data-reveal": number;
	style: CSSProperties;
} {
	return {
		"data-reveal": index,
		style: { transitionDelay: `${index * 90}ms` },
	};
}
