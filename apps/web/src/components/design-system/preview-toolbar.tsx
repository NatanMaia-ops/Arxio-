"use client";

import { cn } from "@arxio/ui/lib/utils";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { ThemeButton } from "@/components/design-system/headers/ds-primitives";

export const VIEWPORTS = [
	{ id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
	{ id: "tablet", label: "Tablet", width: 768, icon: Tablet },
	{ id: "desktop", label: "Desktop", width: null, icon: Monitor },
] as const;

export type ViewportId = (typeof VIEWPORTS)[number]["id"];

export type Viewport = (typeof VIEWPORTS)[number];

export function resolveViewport(id: ViewportId): Viewport {
	return VIEWPORTS.find((item) => item.id === id) ?? VIEWPORTS[2];
}

export function PreviewToolbar({
	viewport,
	onViewportChange,
}: {
	viewport: ViewportId;
	onViewportChange: (id: ViewportId) => void;
}) {
	const active = resolveViewport(viewport);

	return (
		<div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-ax-line border-b bg-ax-surface py-3">
			<div
				role="toolbar"
				aria-label="Largura de visualização"
				className="flex items-center gap-1 rounded-full border border-ax-line bg-ax-fill p-1"
			>
				{VIEWPORTS.map((item) => {
					const Icon = item.icon;
					const isActive = item.id === viewport;

					return (
						<button
							key={item.id}
							type="button"
							aria-pressed={isActive}
							onClick={() => onViewportChange(item.id)}
							className={cn(
								"flex min-h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
								isActive
									? "bg-ax-surface text-ax-ink shadow-sm"
									: "text-ax-ink-soft hover:text-ax-ink",
							)}
						>
							<Icon className="size-4" aria-hidden="true" />
							{item.label}
						</button>
					);
				})}
			</div>

			<p className="text-ax-meta text-xs tabular-nums">
				{active.width ? `${active.width}px de largura` : "largura total"}
			</p>

			<div className="ml-auto flex items-center gap-2">
				<span className="hidden text-ax-meta text-xs sm:inline">
					Alternar tema
				</span>
				<ThemeButton />
			</div>
		</div>
	);
}
