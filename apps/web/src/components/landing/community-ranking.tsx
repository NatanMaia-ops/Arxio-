import { reveal, writers } from "./data";
import { Kicker } from "./kicker";

export function CommunityRanking() {
	return (
		<section
			id="comunidade"
			className="scroll-mt-[72px] border-ax-line border-t py-20 sm:py-[128px]"
		>
			<div className="mx-auto max-w-[1216px] px-5 sm:px-8">
				<div {...reveal(0)} className="flex flex-col items-start gap-5">
					<Kicker>Comunidade</Kicker>
					<h2 className="font-light text-[32px] leading-[1.08] tracking-[-0.03em] sm:text-[40px] lg:text-[48px] lg:leading-[1.05]">
						Quem escreve, aparece.
					</h2>
					<p className="max-w-[52ch] text-[17px] text-ax-body leading-[1.5] sm:text-[19px]">
						O ranking da semana — pontos por leituras, aplausos e dias seguidos
						de escrita.
					</p>
				</div>

				<div {...reveal(1)} className="mt-10 border-ax-line border-b sm:mt-14">
					{writers.map((writer, index) => (
						<div
							key={writer.name}
							className="grid grid-cols-[44px_1fr] items-center gap-x-4 gap-y-2 border-ax-line border-t py-5 sm:grid-cols-[88px_1fr_auto] sm:gap-8 sm:py-7"
						>
							<span
								className={`font-home-interface text-[28px] leading-none sm:text-[38px] ${
									index === 0 ? "text-ax-ink" : "text-ax-rank"
								}`}
							>
								{writer.rank}
							</span>
							<div className="flex flex-col gap-1">
								<span className="font-medium text-[20px] tracking-[-0.01em] sm:text-[25px]">
									{writer.name}
								</span>
								<span className="text-[15px] text-ax-meta sm:text-[16px]">
									{writer.tag}
								</span>
							</div>
							<div className="col-start-2 flex flex-col items-start gap-1 sm:col-start-auto sm:items-end">
								<span className="font-home-interface font-semibold text-[17px]">
									{writer.points}
								</span>
								<span className="font-home-interface text-[13px] text-ax-meta">
									{writer.sub}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
