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
			<h2 className="font-home-display text-ax-ink text-display-md">{title}</h2>
			<p className="text-ax-ink-soft text-body">{description}</p>
		</div>
	);
}
