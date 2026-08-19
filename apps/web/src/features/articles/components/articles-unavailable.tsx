export function ArticlesUnavailable({
	title = "Não foi possível carregar os artigos",
	description = "O serviço de artigos não respondeu. Tente novamente em instantes.",
}: {
	title?: string;
	description?: string;
}) {
	return (
		<div
			role="status"
			className="flex flex-col items-start gap-3 rounded-2xl border border-ax-line bg-ax-surface p-10"
		>
			<h2 className="font-home-display font-light text-[28px] text-ax-ink leading-8.5">
				{title}
			</h2>
			<p className="text-ax-ink-soft text-base leading-6">{description}</p>
		</div>
	);
}
