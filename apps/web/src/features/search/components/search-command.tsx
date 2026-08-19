"use client";

import { Skeleton } from "@arxio/ui/components/skeleton";
import { cn } from "@arxio/ui/lib/utils";
import { Dialog } from "@base-ui/react/dialog";
import { CornerDownLeft, FileText, Search } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { filterSearchResults } from "@/features/search/search-filter";
import { fetchSearchIndex } from "@/features/search/services/search-api";
import type { SearchResult } from "@/features/search/types/search.types";

type IndexStatus = "loading" | "ready" | "error";

export function SearchCommand() {
	const [isOpen, setIsOpen] = useState(false);
	const triggerId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		function handleShortcut(event: KeyboardEvent) {
			if (event.key.toLowerCase() !== "k") return;
			if (!event.metaKey && !event.ctrlKey) return;

			event.preventDefault();
			setIsOpen(true);
		}

		document.addEventListener("keydown", handleShortcut);
		return () => document.removeEventListener("keydown", handleShortcut);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
	}, []);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen} triggerId={triggerId}>
			<Dialog.Trigger
				id={triggerId}
				ref={triggerRef}
				aria-label="Buscar artigos"
				className="flex h-10 min-w-10 cursor-pointer items-center gap-2.5 rounded-full bg-ax-fill/70 px-2.5 text-ax-mute text-sm transition-colors hover:bg-ax-fill-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface sm:w-56 sm:px-4 lg:w-72"
			>
				<Search className="size-4.5 shrink-0" aria-hidden="true" />
				<span className="hidden truncate sm:inline">Buscar</span>
			</Dialog.Trigger>

			{isOpen ? <SearchDialog onClose={close} triggerRef={triggerRef} /> : null}
		</Dialog.Root>
	);
}

type SearchDialogProps = {
	onClose: () => void;
	triggerRef: React.RefObject<HTMLButtonElement | null>;
};

function SearchDialog({ onClose, triggerRef }: SearchDialogProps) {
	const router = useRouter();
	const listId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [status, setStatus] = useState<IndexStatus>("loading");
	const [index, setIndex] = useState<SearchResult[]>([]);
	const requestRef = useRef(0);

	const loadIndex = useCallback(() => {
		const requestId = requestRef.current + 1;
		requestRef.current = requestId;

		setStatus("loading");

		fetchSearchIndex()
			.then((results) => {
				if (requestRef.current !== requestId) return;

				setIndex(results);
				setStatus("ready");
			})
			.catch(() => {
				if (requestRef.current !== requestId) return;

				setStatus("error");
			});
	}, []);

	useEffect(() => {
		loadIndex();

		return () => {
			requestRef.current += 1;
		};
	}, [loadIndex]);

	const results = filterSearchResults(index, query);

	function openResult(id: string) {
		onClose();
		router.push(`/artigos/${id}` as Route);
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (results.length === 0) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((current) => (current + 1) % results.length);
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex(
				(current) => (current - 1 + results.length) % results.length,
			);
		}

		if (event.key === "Enter") {
			event.preventDefault();
			openResult(results[activeIndex].id);
		}
	}

	return (
		<Dialog.Portal>
			<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] dark:bg-black/70" />

			<Dialog.Popup
				aria-label="Buscar artigos"
				initialFocus={inputRef}
				finalFocus={triggerRef}
				className="fixed top-[12vh] left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-ax-line bg-ax-surface shadow-2xl"
			>
				<div className="flex h-14 items-center gap-3 border-ax-line border-b px-4">
					<Search className="size-5 shrink-0 text-ax-mute" aria-hidden="true" />

					<input
						ref={inputRef}
						type="text"
						role="combobox"
						aria-expanded="true"
						aria-controls={listId}
						aria-autocomplete="list"
						aria-activedescendant={
							results.length ? `${listId}-${activeIndex}` : undefined
						}
						aria-label="Buscar por título ou autor"
						placeholder="Buscar por título ou autor"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setActiveIndex(0);
						}}
						onKeyDown={handleInputKeyDown}
						className="h-full w-full bg-transparent text-ax-ink text-base outline-none placeholder:text-ax-placeholder"
					/>

					<Dialog.Close
						aria-label="Fechar busca"
						className="shrink-0 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						<Kbd>esc</Kbd>
					</Dialog.Close>
				</div>

				<div className="max-h-90 overflow-y-auto p-2">
					{status === "loading" ? (
						<div className="flex flex-col gap-1 p-1">
							<Skeleton className="h-11 w-full rounded-lg" />
							<Skeleton className="h-11 w-full rounded-lg" />
							<Skeleton className="h-11 w-full rounded-lg" />
						</div>
					) : null}

					{status === "error" ? (
						<div className="flex flex-col items-start gap-3 px-3 py-6">
							<p className="text-ax-ink-soft text-sm">
								Não foi possível carregar os artigos agora.
							</p>
							<button
								type="button"
								onClick={loadIndex}
								className="cursor-pointer rounded-full border border-ax-line px-3.5 py-2 font-medium text-ax-ink text-sm transition-colors hover:bg-ax-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
							>
								Tentar de novo
							</button>
						</div>
					) : null}

					{status === "ready" ? (
						<section>
							<h2 className="px-3 py-2 font-medium text-ax-meta text-xs uppercase tracking-wide">
								{query ? "Resultados" : "Publicados recentemente"}
							</h2>

							{results.length === 0 ? (
								<p className="px-3 py-6 text-center text-ax-ink-soft text-sm">
									{index.length === 0
										? "Nenhum artigo publicado ainda."
										: `Nada encontrado para “${query}”.`}
								</p>
							) : (
								<div id={listId} role="listbox" aria-label="Resultados">
									{results.map((result, position) => (
										<button
											key={result.id}
											id={`${listId}-${position}`}
											type="button"
											role="option"
											tabIndex={-1}
											aria-selected={position === activeIndex}
											onMouseEnter={() => setActiveIndex(position)}
											onClick={() => openResult(result.id)}
											className={cn(
												"flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
												position === activeIndex
													? "bg-ax-fill"
													: "bg-transparent",
											)}
										>
											<FileText
												className="size-4 shrink-0 text-ax-mute"
												aria-hidden="true"
											/>

											<span className="min-w-0 flex-1 truncate text-ax-ink text-sm">
												{result.title}
											</span>

											<span className="shrink-0 text-ax-meta text-xs">
												{result.authorName}
											</span>
										</button>
									))}
								</div>
							)}
						</section>
					) : null}
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
			</Dialog.Popup>
		</Dialog.Portal>
	);
}

function Kbd({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="inline-flex h-5.5 min-w-5.5 select-none items-center justify-center rounded border border-ax-line-3 bg-ax-surface px-1.5 font-medium font-sans text-[11px] text-ax-mute leading-none">
			{children}
		</kbd>
	);
}
