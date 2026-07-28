"use client";

import { cn } from "@arxio/ui/lib/utils";
import { Bell, Bookmark, PenLine, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
	AvatarButton,
	BrandMark,
	IconButton,
	Kbd,
	ThemeButton,
} from "@/components/design-system/headers/ds-primitives";

const NAV_ITEMS = [
	{ label: "Artigos", isActive: true },
	{ label: "Tópicos", isActive: false },
	{ label: "Autores", isActive: false },
] as const;

export function HeaderEditorial() {
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const desktopSearchRef = useRef<HTMLInputElement>(null);
	const mobileSearchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleShortcut(event: KeyboardEvent) {
			if (event.key !== "/" || event.defaultPrevented) return;

			const target = event.target as HTMLElement | null;
			const isTyping =
				target?.tagName === "INPUT" ||
				target?.tagName === "TEXTAREA" ||
				target?.isContentEditable;

			if (isTyping) return;

			const field = desktopSearchRef.current;
			if (!field || field.offsetParent === null) return;

			event.preventDefault();
			field.focus();
		}

		document.addEventListener("keydown", handleShortcut);
		return () => document.removeEventListener("keydown", handleShortcut);
	}, []);

	useEffect(() => {
		if (isMobileSearchOpen) mobileSearchRef.current?.focus();
	}, [isMobileSearchOpen]);

	return (
		<header className="@container sticky top-0 z-20 border-ax-line border-b bg-ax-surface/90 backdrop-blur-md">
			<div className="mx-auto flex @2xl:h-18 h-15 max-w-360 items-center @2xl:gap-5 gap-2 @2xl:px-6 @4xl:px-10 px-4">
				<div className="flex shrink-0 items-center gap-6">
					<BrandMark />

					<nav
						aria-label="Navegação principal"
						className="@4xl:flex hidden items-center gap-5 font-medium text-sm"
					>
						{NAV_ITEMS.map((item) => (
							<button
								key={item.label}
								type="button"
								aria-current={item.isActive ? "page" : undefined}
								className={cn(
									"flex min-h-11 cursor-pointer items-center border-b-2 pt-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
									item.isActive
										? "border-ax-ink text-ax-ink"
										: "border-transparent text-ax-ink-soft hover:text-ax-ink",
								)}
							>
								{item.label}
							</button>
						))}
					</nav>
				</div>

				<div className="@2xl:flex hidden flex-1 justify-center">
					<SearchField ref={desktopSearchRef} />
				</div>

				<div className="@2xl:ml-0 ml-auto flex items-center @2xl:gap-1 gap-0.5">
					<IconButton
						label="Buscar"
						onClick={() => setIsMobileSearchOpen((value) => !value)}
						className="@2xl:hidden"
					>
						{isMobileSearchOpen ? (
							<X className="size-5" />
						) : (
							<Search className="size-5" />
						)}
					</IconButton>

					<IconButton label="Notificações" badge={3}>
						<Bell className="size-5" />
					</IconButton>

					<IconButton label="Artigos salvos" className="@4xl:flex hidden">
						<Bookmark className="size-5" />
					</IconButton>

					<ThemeButton />

					<span className="mx-1 @4xl:block hidden h-6 w-px bg-ax-line" />

					<button
						type="button"
						className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-ax-ink px-4 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<PenLine className="size-4" aria-hidden="true" />
						<span className="@4xl:inline hidden">Escrever</span>
						<span className="sr-only @4xl:hidden">Escrever artigo</span>
					</button>

					<AvatarButton initials="tm" name="Thiago Monteiro" className="ml-1" />
				</div>
			</div>

			{isMobileSearchOpen ? (
				<div className="@2xl:hidden border-ax-line border-t px-4 py-3">
					<SearchField ref={mobileSearchRef} hasShortcut={false} />
				</div>
			) : null}
		</header>
	);
}

type SearchFieldProps = {
	ref: React.Ref<HTMLInputElement>;
	hasShortcut?: boolean;
};

function SearchField({ ref, hasShortcut = true }: SearchFieldProps) {
	return (
		<div className="flex h-11 w-full max-w-140 items-center gap-2.5 rounded-full border border-ax-line bg-ax-fill px-4 transition-colors focus-within:border-ax-line-3 focus-within:bg-ax-surface focus-within:ring-2 focus-within:ring-ax-ink focus-within:ring-offset-2 focus-within:ring-offset-ax-surface">
			<Search className="size-4.5 shrink-0 text-ax-mute" aria-hidden="true" />

			<input
				ref={ref}
				type="search"
				aria-label="Buscar artigos, autores ou tópicos"
				placeholder="Buscar artigos, autores ou tópicos"
				className="h-full w-full bg-transparent text-ax-ink text-sm outline-none placeholder:text-ax-placeholder [&::-webkit-search-cancel-button]:hidden"
			/>

			{hasShortcut ? (
				<span className="@4xl:block hidden">
					<Kbd>/</Kbd>
				</span>
			) : null}
		</div>
	);
}
