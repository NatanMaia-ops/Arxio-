export default function ArticlesLoading() {
	return (
		<div
			className="mx-auto max-w-220 px-5 pt-8 pb-16 sm:px-8 sm:pt-13.5 lg:px-12 xl:px-20"
			role="status"
		>
			<span className="sr-only">Carregando artigos...</span>

			<div className="h-9 w-44 animate-pulse rounded-lg bg-ax-fill sm:h-11" />

			<div className="mt-5 flex flex-col gap-5">
				{[0, 1, 2].map((index) => (
					<div
						key={index}
						className="flex flex-col gap-4 rounded-2xl border border-ax-line p-5 sm:min-h-62 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
					>
						<div className="flex flex-1 flex-col gap-3">
							<div className="h-7 w-3/4 animate-pulse rounded bg-ax-fill" />
							<div className="h-4 w-full animate-pulse rounded bg-ax-fill" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-ax-fill" />
							<div className="h-4 w-40 animate-pulse rounded bg-ax-fill" />
						</div>

						<div className="order-first h-40 w-full shrink-0 animate-pulse rounded-lg bg-ax-fill sm:order-none sm:h-50 sm:w-60" />
					</div>
				))}
			</div>
		</div>
	);
}
