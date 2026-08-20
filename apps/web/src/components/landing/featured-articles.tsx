import { reveal, secondaryArticles, trending } from "./data";
import { Kicker } from "./kicker";

export function FeaturedArticles() {
	return (
		<section
			id="artigos"
			className="scroll-mt-[72px] border-ax-line border-t py-20 sm:py-[128px]"
		>
			<div className="mx-auto max-w-[1216px] px-5 sm:px-8">
				<div
					{...reveal(0)}
					className="flex flex-wrap items-baseline justify-between gap-6"
				>
					<h2 className="font-light text-[32px] leading-[1.08] tracking-[-0.03em] sm:text-[40px] lg:text-[48px] lg:leading-[1.05]">
						Em destaque esta semana.
					</h2>
					<a
						href="#comecar"
						className="text-[17px] text-ax-ink underline decoration-1 underline-offset-[5px] transition-colors hover:text-ax-ink-soft"
					>
						Ver todos os artigos →
					</a>
				</div>

				<div
					{...reveal(1)}
					className="mt-10 grid grid-cols-1 items-start gap-10 border-ax-ink border-t-2 pt-8 sm:mt-16 sm:pt-10 lg:grid-cols-[8fr_4fr] lg:gap-14"
				>
					<article className="flex flex-col items-start gap-[18px]">
						<Kicker size={12}>Tecnologia</Kicker>
						<a href="#artigos" className="group">
							<h3 className="max-w-[20ch] text-balance font-light text-[32px] leading-[1.12] tracking-[-0.025em] transition-colors group-hover:text-ax-ink-soft sm:text-[42px] lg:text-[52px] lg:leading-[1.06]">
								O que 30 minutos de estudo por dia me ensinaram em um ano
							</h3>
						</a>
						<p className="max-w-[50ch] text-[17px] text-ax-body leading-[1.5] sm:text-[19px]">
							Sem maratonas, sem cursos caros — um caderno, uma rotina e a
							decisão de escrever sobre tudo.
						</p>
						<p className="font-home-interface text-[14px] text-ax-meta">
							Marina Duarte · 8 min de leitura · 214 aplausos
						</p>
					</article>

					<div className="flex h-full flex-col items-start justify-center gap-4 self-stretch border-ax-line border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
						<Kicker size={12}>Início do artigo</Kicker>
						<p className="text-[19px] text-ax-ink-soft italic leading-[1.5] sm:text-[21px]">
							“Eu não comecei escrevendo bem. Comecei escrevendo todo dia — dez
							linhas, no fim da manhã, sobre o que eu tinha acabado de estudar.”
						</p>
						<a
							href="#artigos"
							className="text-[16px] text-ax-ink underline decoration-1 underline-offset-[5px] transition-colors hover:text-ax-ink-soft"
						>
							Continuar lendo →
						</a>
					</div>
				</div>

				<div
					{...reveal(2)}
					className="mt-10 grid grid-cols-1 border-ax-line border-t sm:mt-14 sm:grid-cols-2 lg:grid-cols-4"
				>
					{secondaryArticles.map((article, index) => (
						<article
							key={article.title}
							className={`flex flex-col items-start gap-3 border-ax-line pt-6 pb-1 sm:pr-8 lg:pt-9 ${
								index === 0
									? "lg:pl-0"
									: "border-t sm:border-t-0 lg:border-l lg:pl-8"
							}`}
						>
							<Kicker size={12}>{article.category}</Kicker>
							<a
								href="#artigos"
								className="font-medium text-[20px] leading-[1.22] tracking-[-0.01em] transition-colors hover:text-ax-ink-soft sm:text-[22px]"
							>
								{article.title}
							</a>
							<p className="font-home-interface text-[13px] text-ax-meta">
								{article.meta}
							</p>
						</article>
					))}

					<div className="mt-6 flex flex-col gap-5 bg-ax-fill px-5 pt-8 pb-7 sm:px-7 lg:mt-0 lg:pt-9">
						<Kicker size={12}>Em alta</Kicker>
						{trending.map((item, index) => (
							<div
								key={item.title}
								className="grid grid-cols-[26px_1fr] items-baseline gap-3"
							>
								<span className="font-home-interface font-medium text-[13px] text-ax-rank">
									{index + 1}
								</span>
								<div className="flex flex-col gap-[3px]">
									<a
										href="#artigos"
										className="font-medium text-[17px] leading-[1.3] transition-colors hover:text-ax-ink-soft"
									>
										{item.title}
									</a>
									<span className="font-home-interface text-[12px] text-ax-meta">
										{item.author}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
