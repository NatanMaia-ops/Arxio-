import { reveal, writers } from "./data";
import { Kicker } from "./kicker";

export function CommunityRanking() {
	return (
		<section
			id="comunidade"
			className="scroll-mt-[72px] border-ax-line border-t py-[128px]"
		>
			<div className="mx-auto max-w-[1216px] px-8">
				<div {...reveal(0)} className="flex flex-col items-start gap-5">
					<Kicker>Comunidade</Kicker>
					<h2 className="font-medium text-[48px] leading-[1.05] tracking-[-0.03em]">
						Quem escreve, aparece.
					</h2>
					<p className="max-w-[52ch] text-[19px] text-ax-body leading-[1.5]">
						O ranking da semana — pontos por leituras, aplausos e dias seguidos
						de escrita.
					</p>
				</div>

				<div {...reveal(1)} className="mt-14 border-ax-line border-b">
					{writers.map((writer, index) => (
						<div
							key={writer.name}
							className="grid grid-cols-[88px_1fr_auto] items-center gap-8 border-ax-line border-t py-7"
						>
							<span
								className={`font-home-interface text-[38px] leading-none ${
									index === 0 ? "text-ax-ink" : "text-ax-rank"
								}`}
							>
								{writer.rank}
							</span>
							<div className="flex flex-col gap-1">
								<span className="font-medium text-[25px] tracking-[-0.01em]">
									{writer.name}
								</span>
								<span className="text-[16px] text-ax-meta">{writer.tag}</span>
							</div>
							<div className="flex flex-col items-end gap-1">
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
