import Link from "next/link";

import { reveal } from "./data";

export function FinalCta() {
	return (
		<section id="comecar" className="scroll-mt-[72px] bg-ax-cta py-[148px]">
			<div className="mx-auto flex max-w-[1216px] flex-col items-start gap-7 px-8">
				<h2
					{...reveal(0)}
					className="max-w-[18ch] text-balance font-medium text-[64px] text-white leading-[1.04] tracking-[-0.03em]"
				>
					Pronto para publicar a primeira ideia?
				</h2>
				<p {...reveal(1)} className="text-[19px] text-ax-mute">
					Grátis. Sem anúncios. Feito para quem escreve.
				</p>
				<Link
					{...reveal(2)}
					href="/login"
					className="mt-2 rounded-xl bg-white px-7 py-[15px] font-home-interface font-medium text-[16px] text-ax-ink transition-colors hover:bg-ax-fill-hover"
				>
					Começar a escrever
				</Link>
			</div>
		</section>
	);
}
