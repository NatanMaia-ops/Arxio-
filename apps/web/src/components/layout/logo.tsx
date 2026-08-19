import Link from "next/link";

export function Logo() {
	return (
		<Link
			href={{ pathname: "/feed" }}
			aria-label="Arxio — ir para o feed"
			className="flex shrink-0 items-center rounded-md text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas"
		>
			<ArxioWordmark className="h-7 w-auto sm:h-9" />
		</Link>
	);
}

export function ArxioWordmark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 20973.66 6965.04"
			fill="currentColor"
			aria-hidden="true"
			className={className}
		>
			<polygon points="414.91,0 551.47,0 2887.66,6853.93 2751.15,6853.93" />
			<polygon
				fillOpacity="0.55"
				points="205.11,0 341.66,0 2677.85,6853.93 2541.3,6853.93"
			/>
			<polygon
				fillOpacity="0.28"
				points="-0,0 136.5,0 2472.75,6853.93 2336.19,6853.93"
			/>
			<path d="M15870.31 4529.17c0,1463.32 1074.37,2435.88 2556.32,2435.88 1472.67,0 2547.03,-972.56 2547.03,-2435.88 0,-1463.5 -1074.37,-2445.27 -2547.03,-2445.27 -1481.95,0 -2556.32,981.77 -2556.32,2445.27zm1435.58 -9.29c0,-694.69 453.91,-1157.72 1120.74,-1157.72 657.6,0 1111.45,463.03 1111.45,1157.72 0,703.91 -453.85,1167 -1111.45,1167 -666.82,0 -1120.74,-463.09 -1120.74,-1167z" />
			<polygon points="13619.61,6853.93 15045.9,6853.93 15045.9,2222.85 13619.61,2222.85" />
			<polygon points="9720.18,6853.93 10498.17,5520.22 11294.77,6853.93 12934.15,6853.93 11461.49,4584.77 12989.76,2222.85 11396.65,2222.85 10600.15,3630.68 9748.04,2222.85 8099.37,2222.85 9655.4,4612.52 8099.37,6853.93" />
			<path d="M7512.62 2201.44c-409.71,99.4 -690.31,362.85 -841.66,716.2l-74.19 -685.46 -1342.94 0 0 4621.75 1426.3 0 0 -2009.87c0,-722.33 304.79,-1099.77 832.49,-1227.42l0 -1415.2z" />
			<rect
				transform="matrix(9.38374 -0 3.73045 10.9444 703.875 0.00905445)"
				width="169.77"
				height="626.25"
			/>
			<polygon points="780.17,4149.37 2817.41,4149.37 2817.41,5409.08 344.94,5409.08" />
		</svg>
	);
}

export function ArxioMark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 4280.66 6841.77"
			fill="currentColor"
			aria-hidden="true"
			className={className}
		>
			<polygon points="2690.39,6841.77 4280.66,6841.77 1948.6,0 358.34,0 1770.16,4142 434.45,4142 -0,5399.45 2198.77,5399.45" />
		</svg>
	);
}
