"use client";

import { cn } from "@arxio/ui/lib/utils";
import { Bell, PenLine, Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
	AvatarButton,
	BrandMark,
	IconButton,
	ThemeButton,
} from "@/components/design-system/headers/ds-primitives";

const NAV_ITEMS = [
	{ label: "Artigos", isActive: true },
	{ label: "Coleções", isActive: false },
	{ label: "Autores", isActive: false },
] as const;

export function HeaderCapsule() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchSheetRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isSearchOpen) searchSheetRef.current?.focus();
	}, [isSearchOpen]);

	return (
		<div className="@container sticky top-0 z-20 @2xl:px-6 px-3 @2xl:pt-4 pt-3 pb-1">
			<header className="mx-auto flex @2xl:h-16 h-14 max-w-300 items-center @2xl:gap-3 gap-1.5 @2xl:rounded-full rounded-2xl border border-ax-line bg-ax-surface/80 @2xl:px-3.5 px-2 shadow-ax-float-lg backdrop-blur-xl">
				<BrandMark className="ml-1" />

				<span className="@4xl:block hidden h-6 w-px bg-ax-line" />

				<nav
					aria-label="Navegação principal"
					className="@4xl:flex hidden items-center gap-1"
				>
					{NAV_ITEMS.map((item) => (
						<button
							key={item.label}
							type="button"
							aria-current={item.isActive ? "page" : undefined}
							className={cn(
								"cursor-pointer rounded-full px-3.5 py-2 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
								item.isActive
									? "bg-ax-fill text-ax-ink"
									: "text-ax-ink-soft hover:bg-ax-fill/60 hover:text-ax-ink",
							)}
						>
							{item.label}
						</button>
					))}
				</nav>

				<div className="ml-auto @2xl:flex hidden h-10 @4xl:w-72 w-56 items-center gap-2 rounded-full border border-ax-line bg-ax-fill/70 px-3.5 transition-colors focus-within:border-ax-line-3 focus-within:bg-ax-surface focus-within:ring-2 focus-within:ring-ax-ink focus-within:ring-offset-2 focus-within:ring-offset-ax-surface">
					<Search
						className="size-4.5 shrink-0 text-ax-mute"
						aria-hidden="true"
					/>

					<input
						type="search"
						aria-label="Buscar artigos, autores ou coleções"
						placeholder="Buscar"
						className="h-full w-full bg-transparent text-ax-ink text-sm outline-none placeholder:text-ax-placeholder [&::-webkit-search-cancel-button]:hidden"
					/>

					<Sparkles
						className="size-4 shrink-0 text-ax-accent"
						aria-hidden="true"
					/>
				</div>

				<div className="@2xl:ml-0 ml-auto flex items-center gap-0.5">
					<IconButton
						label={isSearchOpen ? "Fechar busca" : "Buscar"}
						onClick={() => setIsSearchOpen((value) => !value)}
						className="@2xl:hidden size-10"
					>
						{isSearchOpen ? (
							<X className="size-5" />
						) : (
							<Search className="size-5" />
						)}
					</IconButton>

					<IconButton label="Notificações" badge={2} className="size-10">
						<Bell className="size-5" />
					</IconButton>

					<ThemeButton className="size-10" />

					<button
						type="button"
						aria-label="Escrever artigo"
						className="flex size-10 @4xl:w-auto shrink-0 cursor-pointer items-center justify-center @4xl:gap-2 rounded-full bg-ax-ink @4xl:px-4 text-ax-on-ink transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<PenLine className="size-4" aria-hidden="true" />
						<span className="@4xl:inline hidden font-medium text-sm">
							Escrever
						</span>
					</button>

					<AvatarButton
						initials="tm"
						name="Thiago Monteiro"
						showStatus
						className="ml-1"
					/>
				</div>
			</header>

			{isSearchOpen ? (
				<div className="mx-auto mt-2 flex @2xl:hidden h-12 max-w-300 items-center gap-2 rounded-2xl border border-ax-line bg-ax-surface/95 px-4 shadow-ax-float-lg backdrop-blur-xl">
					<Search
						className="size-4.5 shrink-0 text-ax-mute"
						aria-hidden="true"
					/>

					<input
						ref={searchSheetRef}
						type="search"
						aria-label="Buscar artigos, autores ou coleções"
						placeholder="Buscar artigos, autores ou coleções"
						className="h-full w-full bg-transparent text-ax-ink text-sm outline-none placeholder:text-ax-placeholder [&::-webkit-search-cancel-button]:hidden"
					/>
				</div>
			) : null}
		</div>
	);
}
