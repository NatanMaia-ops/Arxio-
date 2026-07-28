import type { Metadata } from "next";

import { CardGallery } from "@/components/design-system/card-gallery";

export const metadata: Metadata = {
	title: "Card do feed | Design system Arxio",
	description:
		"Variações de card do feed com autor, tempo de leitura, conteúdo e data de publicação.",
};

export default function DesignSystemCardPage() {
	return (
		<main className="pt-8">
			<h1 className="font-bold font-home-display text-[36px] text-ax-ink leading-11">
				Card do feed
			</h1>

			<p className="mt-3 max-w-160 text-ax-body text-base leading-6">
				Três direções para o item do feed. Todas carregam autor, tempo de
				leitura, conteúdo e data de publicação nas mesmas três camadas: quem
				escreveu, o que é o artigo e o que dá para fazer com ele.
			</p>

			<div className="mt-8">
				<CardGallery />
			</div>
		</main>
	);
}
