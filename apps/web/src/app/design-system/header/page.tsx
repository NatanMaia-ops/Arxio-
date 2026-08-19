import type { Metadata } from "next";

import { HeaderGallery } from "@/components/design-system/header-gallery";

export const metadata: Metadata = {
	title: "Header | Design system Arxio",
	description:
		"Variações de header com logo, busca e ações de conta para a interface da Arxio.",
};

export default function DesignSystemHeaderPage() {
	return (
		<main className="pt-8">
			<h1 className="font-home-display font-light text-[36px] text-ax-ink leading-11">
				Header
			</h1>

			<p className="mt-3 max-w-160 text-ax-body text-base leading-6">
				Três direções para a barra superior, todas com logo, busca e ações de
				conta. As prévias reagem à largura do container, então o seletor abaixo
				mostra o comportamento real em cada breakpoint.
			</p>

			<div className="mt-8">
				<HeaderGallery />
			</div>
		</main>
	);
}
