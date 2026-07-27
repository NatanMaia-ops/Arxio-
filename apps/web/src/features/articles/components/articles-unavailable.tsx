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
			className="flex flex-col items-start gap-3 rounded-2xl border border-[#e3e3e3] bg-white p-10"
		>
			<h2 className="font-bold font-home-display text-[#111111] text-[28px] leading-8.5">
				{title}
			</h2>
			<p className="text-[#616161] text-base leading-6">{description}</p>
		</div>
	);
}
