import { AppShell } from "@/components/layout/app-shell";

export default function ProfileLoading() {
	return (
		<AppShell>
			<div className="mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
				<div role="status">
					<span className="sr-only">Carregando perfil...</span>

					<div className="flex flex-col gap-6 border-ax-line border-b pb-8 sm:flex-row sm:items-center sm:gap-8 sm:pb-10">
						<div className="size-24 shrink-0 animate-pulse rounded-full bg-ax-fill sm:size-30" />

						<div className="flex flex-1 flex-col gap-3">
							<div className="h-4 w-24 animate-pulse rounded bg-ax-fill" />
							<div className="h-10 w-64 max-w-full animate-pulse rounded bg-ax-fill sm:h-12" />
							<div className="h-5 w-full max-w-xl animate-pulse rounded bg-ax-fill" />
							<div className="h-4 w-44 animate-pulse rounded bg-ax-fill" />
						</div>
					</div>

					<div className="mt-8 sm:mt-10">
						<div className="h-8 w-56 animate-pulse rounded bg-ax-fill" />
						<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{[0, 1, 2].map((index) => (
								<div
									key={index}
									className="h-20 animate-pulse rounded-xl bg-ax-fill"
								/>
							))}
						</div>
					</div>

					<div className="mt-10 sm:mt-12">
						<div className="h-9 w-60 animate-pulse rounded bg-ax-fill" />
						<div className="mt-5 flex flex-col gap-4">
							{[0, 1].map((index) => (
								<div
									key={index}
									className="h-56 animate-pulse rounded-2xl border border-ax-line bg-ax-fill sm:h-52"
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
