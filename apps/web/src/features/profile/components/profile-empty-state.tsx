export function ProfileEmptyState() {
	return (
		<div className="flex flex-col items-start gap-2 rounded-2xl border border-ax-line border-dashed bg-ax-surface p-8 sm:p-10">
			<h3 className="font-home-display text-ax-ink text-display-md">
				Nenhum artigo publicado ainda
			</h3>
			<p className="max-w-xl text-ax-ink-soft text-base leading-6">
				Quando esta pessoa publicar na Arxio, os artigos aparecerão aqui.
			</p>
		</div>
	);
}
