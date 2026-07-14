import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-10 border-[#e3e3e3] border-b bg-white">
			<div className="mx-auto flex h-18 max-w-360 items-center gap-6 px-20">
				<Link
					href="/"
					aria-label="Arxio"
					className="flex h-[27px] w-20 shrink-0 items-center justify-center rounded-[10px] bg-black px-2.5 py-1.5"
				>
					<Image
						src="/icons/logo-arxio-mark.png"
						alt="Arxio"
						width={753}
						height={256}
						className="h-full w-full object-contain"
						priority
					/>
				</Link>

				<SearchField />

				<nav
					aria-label="Navegação principal"
					className="flex shrink-0 items-center gap-6 font-medium text-[#111111] text-sm"
				>
					<Link href="/" aria-current="page">
						Feed
					</Link>
					<Link href={{ pathname: "/buscar" }}>Buscar</Link>
				</nav>

				<button
					type="button"
					className="shrink-0 rounded-full bg-black px-4.5 py-2.5 font-medium text-sm text-white"
				>
					Escrever
				</button>

				<Link
					href={{ pathname: "/perfil" }}
					aria-label="Perfil do usuário"
					className="size-10 shrink-0 rounded-full bg-[#d1d1d1]"
				/>
			</div>
		</header>
	);
}

function SearchField() {
	return (
		<div className="flex flex-1 items-center gap-2 rounded-full bg-[#f2f2f2] px-4.5 py-2.5">
			<Image
				src="/icons/search.svg"
				alt=""
				aria-hidden="true"
				width={14}
				height={14}
			/>
			<input
				type="search"
				placeholder="Buscar artigos, autores e temas"
				className="w-full bg-transparent text-[#616161] text-sm placeholder:text-[#616161] focus:outline-none"
			/>
		</div>
	);
}
