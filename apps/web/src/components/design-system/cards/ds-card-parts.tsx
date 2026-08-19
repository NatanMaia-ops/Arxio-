"use client";

import { cn } from "@arxio/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock3, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import type { FeedArticle } from "@/components/design-system/cards/card-data";
import { formatCount } from "@/components/design-system/cards/card-data";

const COVER_TONES: Record<FeedArticle["coverTone"], string> = {
	neutral: "from-ax-fill to-ax-fill-hover",
	warm: "from-ax-fill via-ax-fill-hover to-ax-accent/20",
	cool: "from-ax-fill via-ax-fill-hover to-ax-ink/10",
};

export function AuthorAvatar({
	initials,
	className,
}: {
	initials: string;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex size-7 shrink-0 items-center justify-center rounded-full bg-ax-fill-hover font-semibold text-[11px] text-ax-ink uppercase",
				className,
			)}
		>
			{initials}
		</span>
	);
}

export function TopicBadge({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded-full border border-ax-line bg-ax-fill/70 px-2.5 py-1 font-medium text-[11px] text-ax-ink-soft uppercase tracking-wide",
				className,
			)}
		>
			{children}
		</span>
	);
}

export function MetaDot() {
	return (
		<span aria-hidden="true" className="text-ax-line-3">
			·
		</span>
	);
}

export function ReadTime({
	minutes,
	className,
}: {
	minutes: number;
	className?: string;
}) {
	return (
		<span className={cn("flex items-center gap-1.5", className)}>
			<Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
			{minutes} min de leitura
		</span>
	);
}

export function CardLink({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<Link
			href={{ pathname: "/design-system/card" }}
			className={cn(
				"after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ax-ink focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-ax-surface",
				className,
			)}
		>
			{children}
		</Link>
	);
}

export function CoverPlaceholder({
	tone,
	className,
	children,
}: {
	tone: FeedArticle["coverTone"];
	className?: string;
	children?: ReactNode;
}) {
	return (
		<div
			className={cn(
				"relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
				COVER_TONES[tone],
				className,
			)}
		>
			<ImageIcon className="size-6 text-ax-line-3" aria-hidden="true" />
			{children}
		</div>
	);
}

export function StatButton({
	icon: Icon,
	label,
	value,
	className,
}: {
	icon: LucideIcon;
	label: string;
	value: number;
	className?: string;
}) {
	return (
		<button
			type="button"
			aria-label={`${label} (${value})`}
			className={cn(
				"relative z-10 flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-2 text-ax-meta text-xs transition-colors hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
				className,
			)}
		>
			<Icon className="size-4 shrink-0" aria-hidden="true" />
			<span className="tabular-nums">{formatCount(value)}</span>
		</button>
	);
}

export function SaveButton({
	isSaved: initialIsSaved,
	className,
}: {
	isSaved: boolean;
	className?: string;
}) {
	const [isSaved, setIsSaved] = useState(initialIsSaved);

	return (
		<button
			type="button"
			aria-pressed={isSaved}
			aria-label={isSaved ? "Remover dos salvos" : "Salvar artigo"}
			onClick={() => setIsSaved((value) => !value)}
			className={cn(
				"relative z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-ax-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
				isSaved ? "text-ax-ink" : "text-ax-meta hover:text-ax-ink",
				className,
			)}
		>
			<Bookmark
				className={cn("size-4.5", isSaved && "fill-current")}
				aria-hidden="true"
			/>
		</button>
	);
}
