"use client";

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { reveal, steps } from "./data";
import { Kicker } from "./kicker";

const FINAL = { reads: 128, claps: 36, comments: 9 };
const COUNT_DURATION = 900;

export function HowItWorks() {
	const [step, setStep] = useState(0);
	const [counts, setCounts] = useState({ reads: 0, claps: 0, comments: 0 });
	const [barOn, setBarOn] = useState(false);

	const stepRef = useRef(0);
	const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const rafRef = useRef<number | null>(null);
	const reducedRef = useRef(false);

	const stopAuto = useCallback(() => {
		if (autoRef.current) {
			clearInterval(autoRef.current);
			autoRef.current = null;
		}
	}, []);

	const select = useCallback(
		(index: number, fromAuto = false) => {
			if (!fromAuto) stopAuto();
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}

			stepRef.current = index;
			setStep(index);
			setBarOn(index === 3);

			if (index !== 2) {
				setCounts({ reads: 0, claps: 0, comments: 0 });
				return;
			}

			if (reducedRef.current) {
				setCounts({ ...FINAL });
				return;
			}

			const start = performance.now();
			const run = (now: number) => {
				const progress = Math.min(1, (now - start) / COUNT_DURATION);
				const eased = 1 - (1 - progress) ** 3;
				setCounts({
					reads: Math.round(FINAL.reads * eased),
					claps: Math.round(FINAL.claps * eased),
					comments: Math.round(FINAL.comments * eased),
				});
				if (progress < 1) rafRef.current = requestAnimationFrame(run);
			};
			rafRef.current = requestAnimationFrame(run);
		},
		[stopAuto],
	);

	useEffect(() => {
		reducedRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reducedRef.current) return;

		autoRef.current = setInterval(() => {
			select((stepRef.current + 1) % steps.length, true);
		}, 4500);

		return () => {
			stopAuto();
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [select, stopAuto]);

	const panelStyle = (index: number): CSSProperties => ({
		opacity: step === index ? 1 : 0,
		transform: step === index ? "translateY(0)" : "translateY(12px)",
		pointerEvents: step === index ? "auto" : "none",
	});

	return (
		<section
			id="como-funciona"
			className="scroll-mt-[72px] border-ax-line border-t py-[128px]"
		>
			<div className="mx-auto max-w-[1216px] px-8">
				<div
					{...reveal(0)}
					className="flex flex-wrap items-end justify-between gap-6"
				>
					<div className="flex flex-col items-start gap-5">
						<Kicker>Como funciona</Kicker>
						<h2 className="text-balance font-medium text-[48px] leading-[1.05] tracking-[-0.03em]">
							Do rascunho à reputação.
						</h2>
					</div>
					<p className="max-w-[36ch] text-[19px] text-ax-body leading-[1.5]">
						Quatro passos, sem fricção. Acompanhe ao lado o que acontece em cada
						um.
					</p>
				</div>

				<div
					{...reveal(1)}
					className="mt-16 grid grid-cols-[5fr_7fr] items-stretch gap-16"
				>
					<div className="flex flex-col justify-center border-ax-line border-t">
						{steps.map((item, index) => {
							const active = step === index;
							return (
								<button
									key={item.title}
									type="button"
									onClick={() => select(index)}
									className={`flex flex-col items-start gap-1.5 border-b border-l-2 px-7 py-[26px] text-left transition-[background-color,border-color] duration-300 ${
										active
											? "border-b-ax-line border-l-ax-ink bg-ax-fill"
											: "border-b-ax-line border-l-transparent"
									}`}
								>
									<span
										className={`font-medium text-[25px] tracking-[-0.01em] transition-colors duration-300 ${
											active ? "text-ax-ink" : "text-ax-faint"
										}`}
									>
										{item.title}
									</span>
									<span
										className={`text-[15px] leading-[1.4] transition-colors duration-300 ${
											active ? "text-ax-body" : "text-ax-faint-2"
										}`}
									>
										{item.description}
									</span>
								</button>
							);
						})}
					</div>

					<div className="relative min-h-[460px] overflow-hidden border border-ax-line-2 bg-ax-fill">
						<div
							style={panelStyle(0)}
							className="absolute inset-0 flex flex-col items-start gap-[18px] p-[52px_56px] transition-[opacity,transform] duration-500 ease-in-out"
						>
							<Kicker size={12}>Rascunho · salvo agora</Kicker>
							<h3 className="max-w-[20ch] font-medium text-[36px] leading-[1.12] tracking-[-0.02em]">
								Por que escrever me faz estudar melhor
								<span className="ml-2 inline-block h-[0.85em] w-[2px] translate-y-[0.08em] animate-[ax-blink_1.1s_infinite] bg-ax-ink align-[-0.08em]" />
							</h3>
							<div className="mt-3 flex w-full flex-col gap-[14px]">
								<div className="h-3 w-[92%] bg-white" />
								<div className="h-3 w-[78%] bg-white" />
								<div className="h-3 w-[56%] bg-white" />
							</div>
							<p className="mt-auto text-[15px] text-ax-meta italic">
								Sem barra de ferramentas. Sem distração. Só o texto.
							</p>
						</div>

						<div
							style={panelStyle(1)}
							className="absolute inset-0 flex flex-col items-start gap-[18px] p-[52px_56px] transition-[opacity,transform] duration-500 ease-in-out"
						>
							<div className="flex items-center gap-[10px]">
								<span className="h-1.5 w-1.5 bg-ax-ink" />
								<Kicker size={12} tone="ink">
									Publicado agora
								</Kicker>
							</div>
							<h3 className="max-w-[20ch] font-medium text-[36px] leading-[1.12] tracking-[-0.02em]">
								Por que escrever me faz estudar melhor
							</h3>
							<p className="font-home-interface text-[14px] text-ax-meta">
								Você · 4 min de leitura · Tecnologia
							</p>
							<div className="mt-3 w-full border-ax-line border-t pt-5">
								<p className="max-w-[40ch] text-[17px] text-ax-ink-soft leading-[1.5]">
									No feed de 312 leitores que acompanham Tecnologia — na hora,
									sem fila de aprovação.
								</p>
							</div>
							<p className="mt-auto text-[15px] text-ax-meta italic">
								Seu artigo, sua página, seu link.
							</p>
						</div>

						<div
							style={panelStyle(2)}
							className="absolute inset-0 flex flex-col items-start gap-[18px] p-[52px_56px] transition-[opacity,transform] duration-500 ease-in-out"
						>
							<Kicker size={12}>Primeiras 48 horas</Kicker>
							<div className="mt-3 flex flex-wrap gap-[72px]">
								<div className="flex flex-col gap-1.5">
									<span className="font-home-interface font-medium text-[56px] leading-none tracking-[-0.02em]">
										{counts.reads}
									</span>
									<Kicker size={12}>Leituras</Kicker>
								</div>
								<div className="flex flex-col gap-1.5">
									<span className="font-home-interface font-medium text-[56px] leading-none tracking-[-0.02em]">
										{counts.claps}
									</span>
									<Kicker size={12}>Aplausos</Kicker>
								</div>
								<div className="flex flex-col gap-1.5">
									<span className="font-home-interface font-medium text-[56px] leading-none tracking-[-0.02em]">
										{counts.comments}
									</span>
									<Kicker size={12}>Comentários</Kicker>
								</div>
							</div>
							<p className="mt-auto text-[15px] text-ax-meta italic">
								Cada leitor pode aplaudir até 10 vezes.
							</p>
						</div>

						<div
							style={panelStyle(3)}
							className="absolute inset-0 flex flex-col items-start gap-[18px] p-[52px_56px] transition-[opacity,transform] duration-500 ease-in-out"
						>
							<Kicker size={12}>Sua reputação</Kicker>
							<h3 className="font-medium text-[40px] leading-[1.1] tracking-[-0.02em]">
								Nível 4 · Autor
							</h3>
							<div className="mt-3 h-[3px] w-full bg-white">
								<div
									className="h-[3px] bg-ax-ink"
									style={{
										width: barOn ? "70%" : "0%",
										transition: "width 1.1s cubic-bezier(0.22, 0.61, 0.36, 1)",
									}}
								/>
							</div>
							<div className="flex w-full justify-between font-home-interface text-[14px] text-ax-meta">
								<span>+462 pts esta semana</span>
								<span>faltam 138 pts para o Nível 5</span>
							</div>
							<p className="mt-auto text-[15px] text-ax-meta italic">
								Leitura +1 pt · Aplauso +5 pts · Sequência multiplica.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
