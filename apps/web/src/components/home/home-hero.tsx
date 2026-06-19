import { displayFont, interfaceFont } from "@/app/fonts";

import { HomeProductPreview } from "./home-product-preview";

export function HomeHero() {
	return (
		<section
			aria-labelledby="home-hero-title"
			className="relative isolate h-[766px] w-full overflow-hidden"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 border border-[#e4e0d8] bg-[#fdfdfc] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0)_38%),linear-gradient(180deg,#ffffff_0%,#faf9f6_42%,#dfe3df_100%)]"
			/>
			<HomeHeroIntro />
			<HomeProductPreview />
		</section>
	);
}

function HomeHeroIntro() {
	return (
		<>
			<button
				type="button"
				className={`${interfaceFont.className} absolute top-5 right-5 z-10 flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white/80 px-[18px] font-semibold text-black text-sm leading-none shadow-[0_1px_2px_rgba(24,24,27,0.04)] backdrop-blur-[4px] transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-black hover:bg-black hover:text-white hover:shadow-[0_4px_14px_rgba(24,24,27,0.12)] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-4 active:bg-black/80 motion-reduce:transition-none sm:top-7 sm:right-8 lg:top-12 lg:right-[58px]`}
			>
				Entrar
			</button>

			<div className="absolute inset-x-4 top-[88px] z-2 flex flex-col items-center text-center sm:top-20 lg:top-[102px]">
				<h1
					id="home-hero-title"
					className={`${displayFont.className} max-w-[780px] font-semibold text-[clamp(2.25rem,3.35vw,3.25rem)] text-black leading-[0.91] tracking-[-0.02em]`}
				>
					Rede acadêmica para compartilhar estudos, projetos e conhecimento.
				</h1>

				<p
					className={`${interfaceFont.className} mt-5 max-w-[421px] font-medium text-black/65 text-sm leading-5 lg:text-xs lg:leading-none`}
				>
					Projeto acadêmico independente desenvolvido por estudantes do curso de
					Ciência da Computação da UEPB.
				</p>

				<button
					type="button"
					className={`${interfaceFont.className} mt-[18px] flex min-h-11 min-w-[190px] cursor-pointer items-center justify-center rounded-full bg-black px-8 font-bold text-[#fdfdfc] text-[13px] leading-none transition-colors duration-200 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-4 active:bg-black/70 motion-reduce:transition-none`}
				>
					QUERO CONHECER
				</button>
			</div>
		</>
	);
}
