import Link from "next/link";

import { displayFont } from "@/app/fonts";

const CATEGORIES = [
	"Tecnologia",
	"Design",
	"Negócios",
	"Cultura",
	"Ciência",
	"Produtividade",
];

export function FeedDiscoverPanel() {
	return (
		<aside className="flex w-88 flex-col gap-4 self-start rounded-2xl border border-[#e3e3e3] bg-white p-7">
			<h2
				className={`${displayFont.className} font-semibold text-[#111111] text-[28px] leading-8.5`}
			>
				Descubra mais
			</h2>

			<ul>
				{CATEGORIES.map((category) => (
					<li key={category}>
						<Link
							href={{ pathname: "/buscar", query: { categoria: category } }}
							className="text-[#111111] text-base leading-6"
						>
							{category}
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}
