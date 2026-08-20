import { AppShell } from "@/components/layout/app-shell";

export default function ProfileLoading() {
	return (
		<AppShell
			heading={
				<div className="flex flex-col gap-6 border-ax-line border-b pb-6 sm:flex-row sm:items-start sm:gap-8">
					<div className="size-24 shrink-0 animate-pulse rounded-full bg-ax-fill sm:size-28" />

					<div className="flex flex-1 flex-col gap-3">
						<div className="h-3.5 w-24 animate-pulse rounded bg-ax-fill" />
						<div className="h-10 w-64 max-w-full animate-pulse rounded bg-ax-fill sm:h-11" />
						<div className="h-5 w-full max-w-160 animate-pulse rounded bg-ax-fill" />
						<div className="h-4 w-44 animate-pulse rounded bg-ax-fill" />
					</div>
				</div>
			}
		>
			<div role="status" className="flex flex-col gap-12 pt-2 sm:gap-14">
				<span className="sr-only">Carregando perfil...</span>

				<div>
					<div className="h-8 w-56 animate-pulse rounded bg-ax-fill" />
					<div className="mt-5 h-28 animate-pulse rounded-3xl bg-ax-surface shadow-ax-float sm:h-25" />
				</div>

				<div>
					<div className="h-8 w-60 animate-pulse rounded bg-ax-fill" />
					<div className="mt-5 flex flex-col gap-4">
						{[0, 1].map((index) => (
							<div
								key={index}
								className="h-56 animate-pulse rounded-3xl bg-ax-surface shadow-ax-float sm:h-60"
							/>
						))}
					</div>
				</div>
			</div>
		</AppShell>
	);
}
