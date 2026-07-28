export type VariantSpec = {
	anatomy: string[];
	news: string[];
	tradeoff: string;
};

export function VariantSpecs({ anatomy, news, tradeoff }: VariantSpec) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<SpecList title="Anatomia" items={anatomy} />
			<SpecList title="Novos elementos" items={news} />

			<div className="rounded-xl border border-ax-line bg-ax-fill/40 p-4">
				<h3 className="font-medium text-ax-meta text-xs uppercase tracking-wide">
					Custo da escolha
				</h3>
				<p className="mt-2.5 text-ax-body text-sm leading-5.5">{tradeoff}</p>
			</div>
		</div>
	);
}

function SpecList({ title, items }: { title: string; items: string[] }) {
	return (
		<div className="rounded-xl border border-ax-line bg-ax-fill/40 p-4">
			<h3 className="font-medium text-ax-meta text-xs uppercase tracking-wide">
				{title}
			</h3>

			<ul className="mt-2.5 flex flex-col gap-2">
				{items.map((item) => (
					<li
						key={item}
						className="flex gap-2.5 text-ax-body text-sm leading-5.5"
					>
						<span
							aria-hidden="true"
							className="mt-2 size-1 shrink-0 rounded-full bg-ax-line-3"
						/>
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}
