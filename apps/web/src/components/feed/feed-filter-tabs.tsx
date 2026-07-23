"use client";

import { useState } from "react";

const FILTERS = ["Recomendados", "Seguindo", "Em alta"] as const;

export function FeedFilterTabs() {
	const [active, setActive] = useState<(typeof FILTERS)[number]>(FILTERS[0]);

	return (
		<div className="flex items-center gap-6" role="tablist">
			{FILTERS.map((filter) => (
				<button
					key={filter}
					type="button"
					role="tab"
					aria-selected={active === filter}
					onClick={() => setActive(filter)}
					className={`font-medium text-[13px] uppercase leading-4.5 ${
						active === filter ? "text-black" : "text-[#616161]"
					}`}
				>
					{filter}
				</button>
			))}
		</div>
	);
}
