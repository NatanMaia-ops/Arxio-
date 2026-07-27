"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isMounted && isDark ? "Usar tema claro" : "Usar tema escuro"}
			className="flex size-11 shrink-0 items-center justify-center rounded-full text-ax-ink-soft transition-colors hover:bg-ax-fill hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
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
		</button>
	);
}
