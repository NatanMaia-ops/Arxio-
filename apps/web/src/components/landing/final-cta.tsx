import Link from "next/link";

import { reveal } from "./data";

export function FinalCta() {
	return (
		<section
			id="comecar"
			className="scroll-mt-[72px] bg-ax-cta py-20 sm:py-[148px]"
		>
			<div className="mx-auto flex max-w-[1216px] flex-col items-start gap-6 px-5 sm:gap-7 sm:px-8">
				<h2
					{...reveal(0)}
					className="max-w-[18ch] text-balance font-light text-[36px] text-ax-on-ink leading-[1.08] tracking-[-0.03em] sm:text-[48px] lg:text-[64px] lg:leading-[1.04]"
				>
					Pronto para publicar a primeira ideia?
				</h2>
				<p {...reveal(1)} className="text-[17px] text-ax-mute sm:text-[19px]">
					Grátis. Sem anúncios. Feito para quem escreve.
				</p>
				<Link
					{...reveal(2)}
					href="/login"
					className="mt-2 rounded-xl bg-ax-surface px-7 py-[15px] font-home-interface font-medium text-[16px] text-ax-ink transition-colors hover:bg-ax-fill-hover"
				>
					Começar a escrever
				</Link>
			</div>
		</section>
	);
}
