export default function ArticleLoading() {
	return (
		<div
			className="mx-auto max-w-180 px-5 pt-8 pb-24 sm:px-6 sm:pt-13.5"
			role="status"
		>
			<span className="sr-only">Carregando artigo...</span>

			<div className="h-11 w-40 animate-pulse rounded bg-ax-fill" />
			<div className="mt-4 h-4 w-32 animate-pulse rounded bg-ax-fill" />

			<div className="mt-3 flex flex-col gap-3">
				<div className="h-10 w-full animate-pulse rounded bg-ax-fill sm:h-12 lg:h-14" />
				<div className="h-10 w-2/3 animate-pulse rounded bg-ax-fill sm:h-12 lg:h-14" />
			</div>

			<div className="mt-6 h-5 w-56 animate-pulse rounded bg-ax-fill" />

			<div className="mt-14 flex flex-col gap-4">
				{[0, 1, 2, 3, 4, 5].map((index) => (
					<div
						key={index}
						className="h-5 animate-pulse rounded bg-ax-fill"
						style={{ width: index % 3 === 2 ? "60%" : "100%" }}
					/>
				))}
			</div>
		</div>
	);
}
