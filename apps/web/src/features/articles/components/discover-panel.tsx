import Link from "next/link";

const CATEGORIES = [
	"Tecnologia",
	"Design",
	"Negócios",
	"Cultura",
	"Ciência",
	"Produtividade",
];

export function DiscoverPanel() {
	return (
		<aside className="flex w-88 flex-col gap-4 self-start rounded-2xl border border-[#e3e3e3] bg-white p-7">
			<h2 className="font-bold font-home-display text-[#111111] text-[28px] leading-8.5">
				Descubra mais
			</h2>

			<ul className="flex flex-col gap-1">
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
