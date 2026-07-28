"use client";

import { cn } from "@arxio/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type BrandMarkProps = {
	className?: string;
	label?: string;
};

export function BrandMark({ className, label = "Arxio" }: BrandMarkProps) {
	return (
		<span
			className={cn(
				"flex h-6.75 w-20 shrink-0 items-center justify-center rounded-[10px] bg-ax-brand px-2.5 py-1.5",
				className,
			)}
		>
			<Image
				src="/icons/logo-arxio-mark.png"
				alt={label}
				width={753}
				height={256}
				className="h-full w-full object-contain"
			/>
		</span>
	);
}

type IconButtonProps = {
	label: string;
	children: ReactNode;
	onClick?: () => void;
	className?: string;
	badge?: number;
};

export function IconButton({
	label,
	children,
	onClick,
	className,
	badge,
}: IconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={badge ? `${label} (${badge} não lidas)` : label}
			className={cn(
				"relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ax-ink-soft transition-colors hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
				className,
			)}
		>
			{children}

			{badge ? (
				<span className="pointer-events-none absolute top-1.5 right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ax-accent px-1 font-semibold text-[10px] text-ax-on-accent tabular-nums ring-2 ring-ax-surface">
					{badge > 9 ? "9+" : badge}
				</span>
			) : null}
		</button>
	);
}

type AvatarButtonProps = {
	initials: string;
	name: string;
	className?: string;
	showStatus?: boolean;
};

export function AvatarButton({
	initials,
	name,
	className,
	showStatus = false,
}: AvatarButtonProps) {
	return (
		<button
			type="button"
			aria-label={`Abrir menu de ${name}`}
			className={cn(
				"relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ax-fill-hover font-semibold text-ax-ink text-xs uppercase transition-shadow hover:ring-2 hover:ring-ax-line-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
				className,
			)}
		>
			{initials}

			{showStatus ? (
				<span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-ax-accent ring-2 ring-ax-surface" />
			) : null}
		</button>
	);
}

export function Kbd({ children }: { children: ReactNode }) {
	return (
		<kbd className="inline-flex h-5.5 min-w-5.5 select-none items-center justify-center rounded border border-ax-line-3 bg-ax-surface px-1.5 font-medium font-sans text-[11px] text-ax-mute leading-none">
			{children}
		</kbd>
	);
}

export function ThemeButton({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const isDark = isMounted && resolvedTheme === "dark";

	return (
		<IconButton
			label={isDark ? "Usar tema claro" : "Usar tema escuro"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className={className}
		>
			{isMounted ? (
				isDark ? (
					<Sun className="size-5" />
				) : (
					<Moon className="size-5" />
				)
			) : (
				<span className="size-5" />
			)}
		</IconButton>
	);
}
