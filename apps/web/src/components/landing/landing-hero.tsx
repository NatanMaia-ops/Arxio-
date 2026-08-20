import Image from "next/image";
import Link from "next/link";

import { reveal } from "./data";

export function LandingHero() {
	return (
		<section
			id="topo"
			className="scroll-mt-[72px] pt-28 pb-20 sm:pt-[184px] sm:pb-[148px]"
		>
			<div className="mx-auto grid max-w-[1216px] grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[7fr_5fr] lg:gap-16">
				<div className="flex flex-col items-start gap-6 sm:gap-7">
					<p
						{...reveal(0)}
						className="font-home-interface font-medium text-[13px] text-ax-meta uppercase tracking-[0.14em]"
					>
						Plataforma de publicação
					</p>
					<h1
						{...reveal(1)}
						className="max-w-[16ch] text-balance font-light text-[40px] leading-[1.06] tracking-[-0.03em] sm:text-[56px] sm:leading-[1.02] lg:text-[72px]"
					>
						Toda ideia merece leitores.
					</h1>
					<p
						{...reveal(2)}
						className="max-w-[52ch] text-pretty text-[18px] text-ax-body leading-[1.5] sm:text-[21px]"
					>
						Escreva sobre o que você estuda, publique em segundos e veja sua
						reputação crescer a cada leitura.
					</p>
					<div
						{...reveal(3)}
						className="mt-2 flex flex-wrap items-center gap-3 sm:gap-[14px]"
					>
						<Link
							href="/login"
							className="rounded-xl bg-ax-ink px-[26px] py-[14px] font-home-interface font-medium text-[16px] text-ax-on-ink transition-colors hover:bg-ax-ink-hover"
						>
							Começar a escrever
						</Link>
						<Link
							href={{ pathname: "/feed" }}
							className="rounded-xl border border-ax-line-3 px-[26px] py-[14px] font-home-interface font-medium text-[16px] text-ax-ink transition-colors hover:bg-ax-fill"
						>
							Explorar artigos
						</Link>
					</div>
				</div>
				<Image
					{...reveal(2)}
					src="/logo-arxio.png"
					alt="Arxio"
					width={2694}
					height={895}
					priority
					className="hidden h-auto w-full max-w-[440px] justify-self-end lg:block"
				/>
			</div>
		</section>
	);
}
