export function ProfileEmptyState() {
	return (
		<div className="flex flex-col items-start gap-3 rounded-3xl border border-ax-line border-dashed bg-ax-surface/70 p-10">
			<h3 className="font-home-display text-ax-ink text-display-md">
				Nenhum artigo publicado ainda
			</h3>
			<p className="max-w-160 text-ax-body text-body">
				Quando esta pessoa publicar na Arxio, os artigos aparecerão aqui.
			</p>
		</div>
	);
}
