import Image from "next/image";

import { displayFont } from "@/app/fonts";
import { LoginCard } from "@/features/auth/components/login-card";
import { LoginGuard } from "@/features/auth/components/login-guard";

export default function LoginPage() {
	return (
		<LoginGuard>
			<div className="grid min-h-dvh grid-cols-1 bg-ax-surface px-6 text-ax-ink md:grid-cols-2 md:px-14 lg:px-20">
				<section className="flex min-w-0 flex-col items-center pt-8 pb-6 md:pt-10 md:pr-12 md:pb-12 lg:pr-16">
					<div className="flex w-full min-w-0 max-w-xl flex-1 flex-col">
						<Image
							src="/icons/logo-arxio-mark.png"
							alt="Arxio"
							width={753}
							height={256}
							priority
							className="h-7 w-auto self-start brightness-0 md:h-8"
						/>

						<div className="flex flex-1 flex-col justify-center gap-6 py-12 md:py-0">
							<h1
								className={`${displayFont.className} font-medium text-[34px] text-ax-ink leading-[1.1] tracking-[-0.015em] md:text-[52px] md:leading-[1.08] lg:text-[60px]`}
							>
								Ideias que merecem tempo.
							</h1>

							<div className="flex flex-col gap-3">
								<p className="max-w-md text-ax-ink-soft text-lg leading-relaxed">
									Descubra novas perspectivas, acompanhe autores e publique
									aquilo que você aprendeu.
								</p>

								<p className="max-w-md text-[#8c877e] text-sm leading-relaxed">
									Leituras sem pressa, feitas para durar — um espaço acadêmico
									onde estudos, ensaios e descobertas encontram seus leitores.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="flex min-w-0 items-center justify-center border-ax-line border-t pt-6 pb-14 md:border-t-0 md:border-l md:py-14 md:pl-12 lg:pl-16">
					<LoginCard />
				</section>
			</div>
		</LoginGuard>
	);
}
