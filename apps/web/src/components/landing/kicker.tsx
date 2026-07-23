import type { ReactNode } from "react";

type KickerProps = {
	children: ReactNode;
	size?: number;
	tone?: "meta" | "ink";
};

export function Kicker({ children, size = 13, tone = "meta" }: KickerProps) {
	return (
		<p
			className={`font-home-interface font-medium uppercase tracking-[0.14em] ${
				tone === "ink" ? "text-ax-ink" : "text-ax-meta"
			}`}
			style={{ fontSize: size }}
		>
			{children}
		</p>
	);
}
