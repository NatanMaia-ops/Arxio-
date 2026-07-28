"use client";

import { cn } from "@arxio/ui/lib/utils";
import {
	ArrowRight,
	Bell,
	Clock,
	CornerDownLeft,
	FileText,
	PenLine,
	Search,
	SlidersHorizontal,
	User,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
	AvatarButton,
	BrandMark,
	IconButton,
	Kbd,
	ThemeButton,
} from "@/components/design-system/headers/ds-primitives";

const TOPICS = [
	"Todos",
	"Inteligência artificial",
	"Engenharia",
	"Pesquisa",
	"Design",
	"Dados",
	"Carreira",
	"Open source",
] as const;

const RECENT_SEARCHES = [
	"modelos de difusão",
	"revisão por pares",
	"arquitetura hexagonal",
] as const;

const SUGGESTIONS = [
	{ kind: "artigo", title: "Como estruturar um artigo de pesquisa aplicada" },
	{ kind: "artigo", title: "Reprodutibilidade em experimentos de ML" },
	{ kind: "autor", title: "Marina Duarte" },
	{ kind: "tópico", title: "Sistemas distribuídos" },
] as const;

function findScrollRoot(node: HTMLElement) {
	let current = node.parentElement;

	while (current) {
		const { overflowY } = getComputedStyle(current);
		if (overflowY === "auto" || overflowY === "scroll") return current;
		current = current.parentElement;
	}

	return null;
}

export function HeaderCommand() {
	const [isCondensed, setIsCondensed] = useState(false);
	const [isPaletteOpen, setIsPaletteOpen] = useState(false);
	const [activeTopic, setActiveTopic] = useState<string>(TOPICS[0]);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => setIsCondensed(!entry.isIntersecting),
			{ root: findScrollRoot(sentinel), threshold: 1 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		function handleShortcut(event: KeyboardEvent) {
			if (event.key.toLowerCase() !== "k") return;
			if (!event.metaKey && !event.ctrlKey) return;

			event.preventDefault();
			setIsPaletteOpen(true);
		}

		document.addEventListener("keydown", handleShortcut);
		return () => document.removeEventListener("keydown", handleShortcut);
	}, []);

	function closePalette() {
		setIsPaletteOpen(false);
		triggerRef.current?.focus();
	}

	return (
		<>
			<div ref={sentinelRef} aria-hidden="true" className="h-px" />

			<header className="@container sticky top-0 z-20 border-ax-line border-b bg-ax-surface">
				<div className="mx-auto flex h-14 max-w-360 items-center gap-3 @2xl:px-6 @4xl:px-10 px-4">
					<BrandMark />

					<button
						ref={triggerRef}
						type="button"
						onClick={() => setIsPaletteOpen(true)}
						aria-label="Buscar na Arxio"
						aria-haspopup="dialog"
						className="ml-auto flex h-9.5 @2xl:w-64 @4xl:w-80 cursor-pointer items-center gap-2.5 rounded-lg border border-ax-line bg-ax-fill px-3 text-ax-mute text-sm transition-colors hover:border-ax-line-3 hover:bg-ax-fill-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<Search className="size-4.5 shrink-0" aria-hidden="true" />
						<span className="@2xl:inline hidden truncate">Buscar</span>
						<span className="ml-auto @2xl:flex hidden items-center gap-1">
							<Kbd>⌘</Kbd>
							<Kbd>K</Kbd>
						</span>
					</button>

					<div className="flex items-center @2xl:gap-1 gap-0.5">
						<IconButton label="Notificações" badge={5}>
							<Bell className="size-5" />
						</IconButton>

						<ThemeButton />

						<button
							type="button"
							className="@4xl:flex hidden min-h-9.5 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ax-ink bg-ax-ink px-3.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
						>
							<PenLine className="size-4" aria-hidden="true" />
							Escrever
						</button>

						<AvatarButton
							initials="tm"
							name="Thiago Monteiro"
							className="ml-1"
						/>
					</div>
				</div>

				<div
					className={cn(
						"grid overflow-hidden border-ax-line/60 transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
						isCondensed
							? "grid-rows-[0fr] opacity-0"
							: "grid-rows-[1fr] border-t opacity-100",
					)}
				>
					<div className="min-h-0">
						<div className="mx-auto flex max-w-360 items-center gap-2 @2xl:px-6 @4xl:px-10 px-4">
							<div
								role="toolbar"
								aria-label="Filtrar por tópico"
								className="flex flex-1 items-center gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							>
								{TOPICS.map((topic) => {
									const isActive = topic === activeTopic;

									return (
										<button
											key={topic}
											type="button"
											aria-pressed={isActive}
											onClick={() => setActiveTopic(topic)}
											className={cn(
												"shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
												isActive
													? "bg-ax-ink text-ax-on-ink"
													: "text-ax-ink-soft hover:bg-ax-fill hover:text-ax-ink",
											)}
										>
											{topic}
										</button>
									);
								})}
							</div>

							<button
								type="button"
								className="@2xl:flex hidden shrink-0 cursor-pointer items-center gap-2 rounded-full border border-ax-line px-3 py-1.5 font-medium text-ax-ink-soft text-sm transition-colors hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
							>
								<SlidersHorizontal className="size-4" aria-hidden="true" />
								Filtros
							</button>
						</div>
					</div>
				</div>
			</header>

			{isPaletteOpen ? <CommandPalette onClose={closePalette} /> : null}
		</>
	);
}

function CommandPalette({ onClose }: { onClose: () => void }) {
	const listId = useId();
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);

	const results = query
		? SUGGESTIONS.filter((item) =>
				item.title.toLowerCase().includes(query.toLowerCase()),
			)
		: SUGGESTIONS;

	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
			}
		}

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (results.length === 0) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((index) => (index + 1) % results.length);
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((index) => (index - 1 + results.length) % results.length);
		}

		if (event.key === "Enter") {
			event.preventDefault();
			onClose();
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
			<button
				type="button"
				aria-label="Fechar busca"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px] dark:bg-black/70"
			/>

			<div
				role="dialog"
				aria-modal="true"
				aria-label="Busca"
				className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-ax-line bg-ax-surface shadow-2xl"
			>
				<div className="flex h-14 items-center gap-3 border-ax-line border-b px-4">
					<Search className="size-5 shrink-0 text-ax-mute" aria-hidden="true" />

					<input
						// biome-ignore lint/a11y/noAutofocus: foco inicial esperado em um command palette
						autoFocus
						type="text"
						role="combobox"
						aria-expanded="true"
						aria-controls={listId}
						aria-autocomplete="list"
						aria-activedescendant={
							results.length ? `${listId}-${activeIndex}` : undefined
						}
						aria-label="Buscar artigos, autores ou tópicos"
						placeholder="Buscar artigos, autores ou tópicos"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setActiveIndex(0);
						}}
						onKeyDown={handleInputKeyDown}
						className="h-full w-full bg-transparent text-ax-ink text-base outline-none placeholder:text-ax-placeholder"
					/>

					<Kbd>esc</Kbd>
				</div>

				<div className="max-h-90 overflow-y-auto p-2">
					{query === "" ? (
						<section className="mb-2">
							<h2 className="px-3 py-2 font-medium text-ax-meta text-xs uppercase tracking-wide">
								Buscas recentes
							</h2>

							{RECENT_SEARCHES.map((item) => (
								<button
									key={item}
									type="button"
									onClick={() => setQuery(item)}
									className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-ax-ink-soft text-sm transition-colors hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink"
								>
									<Clock className="size-4 shrink-0" aria-hidden="true" />
									{item}
								</button>
							))}
						</section>
					) : null}

					<section>
						<h2 className="px-3 py-2 font-medium text-ax-meta text-xs uppercase tracking-wide">
							{query ? "Resultados" : "Sugestões"}
						</h2>

						{results.length === 0 ? (
							<p className="px-3 py-6 text-center text-ax-ink-soft text-sm">
								Nada encontrado para “{query}”. Tente buscar por um tópico como
								“pesquisa”.
							</p>
						) : (
							<div id={listId} role="listbox" aria-label="Resultados">
								{results.map((item, index) => (
									<button
										key={item.title}
										id={`${listId}-${index}`}
										type="button"
										role="option"
										aria-selected={index === activeIndex}
										onMouseEnter={() => setActiveIndex(index)}
										onClick={onClose}
										className={cn(
											"flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
											index === activeIndex ? "bg-ax-fill" : "bg-transparent",
										)}
									>
										{item.kind === "autor" ? (
											<User
												className="size-4 shrink-0 text-ax-mute"
												aria-hidden="true"
											/>
										) : item.kind === "tópico" ? (
											<ArrowRight
												className="size-4 shrink-0 text-ax-mute"
												aria-hidden="true"
											/>
										) : (
											<FileText
												className="size-4 shrink-0 text-ax-mute"
												aria-hidden="true"
											/>
										)}

										<span className="flex-1 truncate text-ax-ink text-sm">
											{item.title}
										</span>

										<span className="text-ax-meta text-xs capitalize">
											{item.kind}
										</span>
									</button>
								))}
							</div>
						)}
					</section>
				</div>

				<footer className="flex items-center gap-4 border-ax-line border-t bg-ax-fill/60 px-4 py-2.5 text-ax-meta text-xs">
					<span className="flex items-center gap-1.5">
						<Kbd>↑</Kbd>
						<Kbd>↓</Kbd>
						navegar
					</span>
					<span className="flex items-center gap-1.5">
						<Kbd>
							<CornerDownLeft className="size-3" aria-hidden="true" />
						</Kbd>
						abrir
					</span>
				</footer>
			</div>
		</div>
	);
}
