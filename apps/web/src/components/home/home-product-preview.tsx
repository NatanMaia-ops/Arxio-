import Image from "next/image";

import { displayFont, interfaceFont } from "@/app/fonts";

const ASSET_PATH = "/icons";

const topics = [
	{
		label: "LLMs",
		className:
			"top-[61.54%] right-[22.84%] bottom-[31.94%] left-[71.9%] bg-[#0077c2] text-white text-[0.902cqw]",
	},
	{
		label: "Arquitetura",
		className:
			"top-[61.54%] right-[14.14%] bottom-[31.87%] left-[77.78%] bg-[#1a1714] text-white text-[0.827cqw]",
	},
	{
		label: "Claude Code",
		className:
			"top-[69.18%] right-[20.06%] bottom-[24.29%] left-[71.9%] bg-[#a86e1f] text-white text-[0.902cqw]",
	},
	{
		label: "Padrões de Projeto",
		className:
			"top-[69.23%] right-[7.62%] bottom-[24.18%] left-[80.62%] bg-[#dde8e0] text-black text-[0.827cqw]",
	},
	{
		label: "Desenvolvimento de Software",
		className:
			"top-[76.83%] right-[12.76%] bottom-[16.65%] left-[71.9%] bg-[#3b6b4a] text-white text-[0.827cqw]",
	},
	{
		label: "Projetos",
		className:
			"top-[84.34%] right-[19.65%] bottom-[9.07%] left-[71.9%] bg-[#7058a3] text-white text-[0.827cqw]",
	},
] as const;

type MockupAssetProps = {
	className: string;
	name: string;
	objectFit?: "contain" | "cover";
};

function MockupAsset({
	className,
	name,
	objectFit = "contain",
}: MockupAssetProps) {
	return (
		<span className={`absolute block ${className}`}>
			<Image
				fill
				unoptimized
				alt=""
				className={objectFit === "cover" ? "object-cover" : "object-contain"}
				sizes="(min-width: 1200px) 180px, 20vw"
				src={`${ASSET_PATH}/${name}.svg`}
			/>
		</span>
	);
}

export function HomeProductPreview() {
	return (
		<figure
			aria-labelledby="home-product-preview-caption"
			className="absolute bottom-0 left-1/2 z-1 aspect-[1089/364] w-[calc(100%-2rem)] max-w-[1089px] -translate-x-1/2 overflow-hidden rounded-t-[1.286cqw] shadow-[0_-12px_40px_rgba(24,32,27,0.06)] [container-type:inline-size] sm:w-[calc(100%-3rem)] lg:top-[402px] lg:bottom-auto lg:ml-[10px]"
		>
			<figcaption id="home-product-preview-caption" className="sr-only">
				Prévia da linha do tempo acadêmica da Arxio.
			</figcaption>

			<div aria-hidden="true" className="absolute inset-0 select-none">
				<div className="absolute inset-x-0 top-[0.55%] bottom-0 rounded-t-[1.286cqw] border-black/25 border-x border-t bg-[#fdfdfc]" />

				<div className="absolute top-[0.27%] right-[0.09%] bottom-[78.57%] left-[0.09%] rounded-t-[1.194cqw] border-black/25 border-b" />

				<span className="absolute top-[7.14%] right-[86.41%] left-[5.79%] aspect-[454/151] cursor-pointer overflow-hidden transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none">
					<Image
						fill
						unoptimized
						alt=""
						className="object-cover object-top"
						sizes="90px"
						src={`${ASSET_PATH}/logo-arxio.svg`}
					/>
				</span>

				<p
					className={`${displayFont.className} absolute top-[10.44%] right-[56.47%] bottom-[86.54%] left-[35.08%] cursor-pointer whitespace-nowrap text-center font-medium text-[1.102cqw] text-black leading-[0.91] transition-opacity duration-200 hover:opacity-60 motion-reduce:transition-none`}
				>
					Linha do tempo
				</p>
				<p
					className={`${displayFont.className} absolute top-[10.44%] right-[47.84%] bottom-[86.54%] left-[47.11%] cursor-pointer whitespace-nowrap text-center font-medium text-[1.102cqw] text-black/50 leading-[0.91] transition-colors duration-200 hover:text-black motion-reduce:transition-none`}
				>
					Seguindo
				</p>

				<div className="group/write contents">
					<div className="absolute top-[9.07%] left-[78.79%] h-[5.77%] w-[9.09%] cursor-pointer rounded-[1.865cqw] bg-[#3b6b4a] transition-[transform,box-shadow,filter] duration-200 group-hover/write:scale-[1.04] group-hover/write:shadow-[0_0.4cqw_1.2cqw_rgba(59,107,74,0.22)] group-hover/write:brightness-110 group-active/write:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none" />
					<MockupAsset
						className="pointer-events-none top-[10.88%] left-[79.89%] aspect-square w-[0.67%] transition-transform duration-200 group-hover/write:scale-[1.04] group-active/write:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
						name="pen"
					/>
					<p
						className={`${interfaceFont.className} pointer-events-none absolute top-[10.99%] right-[13.96%] bottom-[87.36%] left-[81.73%] whitespace-nowrap text-center font-bold text-[0.574cqw] text-white leading-[0.91] transition-transform duration-200 group-hover/write:scale-[1.04] group-active/write:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none`}
					>
						Escrever Artigo
					</p>
				</div>
				<MockupAsset
					className="top-[9.34%] left-[88.98%] aspect-square w-[1.837%] cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="profile"
				/>

				<p
					className={`${displayFont.className} absolute top-[44.23%] right-[80.99%] bottom-[51.65%] left-[4.13%] whitespace-nowrap text-center font-medium text-[1.469cqw] text-black leading-[0.91]`}
				>
					Destaques da Semana
				</p>

				<div className="group/search contents">
					<div className="absolute top-[42.86%] right-[37.14%] bottom-1/2 left-[40.96%] cursor-text rounded-[0.478cqw] border-[0.65px] border-black/25 bg-white transition-[border-color,box-shadow] duration-200 group-hover/search:border-black/45 group-hover/search:shadow-[0_0.25cqw_0.9cqw_rgba(24,24,27,0.08)] motion-reduce:transition-none" />
					<p
						className={`${displayFont.className} pointer-events-none absolute top-[45.36%] right-[52.08%] bottom-[52.72%] left-[42.6%] whitespace-nowrap text-center font-light text-[0.716cqw] text-black/50 leading-[0.91] transition-colors duration-200 group-hover/search:text-black/70 motion-reduce:transition-none`}
					>
						buscar artigo...
					</p>
					<MockupAsset
						className="pointer-events-none top-[45.6%] left-[60.53%] aspect-square w-[0.72%] transition-transform duration-200 group-hover/search:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
						name="search"
					/>
				</div>

				<div className="absolute top-[52.75%] right-[37.1%] bottom-0 left-[4.13%] rounded-t-[0.459cqw] border-black/20 border-x border-t bg-[rgba(234,234,234,0.3)]" />

				<MockupAsset
					className="top-[58.52%] left-[7.16%] aspect-square w-[1.47%] cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="avatar"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[59.62%] right-[85.03%] bottom-[38.46%] left-[9.18%] font-medium text-[0.673cqw] text-black leading-none`}
				>
					Nome do Autor
				</p>

				<MockupAsset
					className="top-[58.79%] left-[45.09%] aspect-square w-[0.99%]"
					name="calendar"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[59.62%] right-[47.93%] bottom-[38.46%] left-[46.56%] font-medium text-[0.641cqw] text-black/65 leading-none`}
				>
					10/06/2026
				</p>
				<MockupAsset
					className="top-[58.79%] left-[51.61%] aspect-square w-[1.1%]"
					name="clock"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[59.34%] right-[40.22%] bottom-[38.74%] left-[53.17%] font-medium text-[0.675cqw] text-black/65 leading-none`}
				>
					15 minutos de leitura
				</p>

				<h2
					className={`${interfaceFont.className} absolute top-[66.76%] right-[56.38%] bottom-[22.25%] left-[7.16%] cursor-pointer font-extrabold text-[1.837cqw] text-black leading-none transition-opacity duration-200 hover:opacity-65 motion-reduce:transition-none`}
				>
					Já experimentei mais de 100 habilidades do Claude Code. Estas são as
					melhores.
				</h2>
				<p
					className={`${interfaceFont.className} absolute top-[80.22%] right-[56.38%] bottom-[14.29%] left-[7.16%] font-medium text-[0.918cqw] text-black/50 leading-none`}
				>
					Independentemente da tarefa que você execute com o Claude Code, se
					você não estiver usando habilidades específicas, obterá um resultado
					bastante genérico.
				</p>

				<MockupAsset
					className="top-[66.76%] left-[47.2%] h-[18.41%] w-[12.58%] cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
					name="claude"
				/>

				<MockupAsset
					className="top-[91.48%] left-[7.16%] h-[3.16%] w-[1.24%] cursor-pointer transition-transform duration-150 hover:scale-[1.15] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="like"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[91.76%] right-[89.53%] bottom-[5.77%] left-[8.91%] font-medium text-[0.867cqw] text-black leading-none`}
				>
					100
				</p>
				<MockupAsset
					className="top-[91.48%] left-[11.85%] aspect-square w-[1.05%] cursor-pointer transition-transform duration-150 hover:scale-[1.15] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="comment"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[91.76%] right-[85.08%] bottom-[5.77%] left-[13.36%] font-medium text-[0.867cqw] text-black leading-none`}
				>
					5
				</p>
				<MockupAsset
					className="top-[91.48%] left-[15.43%] aspect-[14/18] w-[0.81%] cursor-pointer transition-transform duration-150 hover:scale-[1.15] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="bookmark"
				/>
				<p
					className={`${interfaceFont.className} absolute top-[91.76%] right-[81.72%] bottom-[5.77%] left-[16.71%] font-medium text-[0.867cqw] text-black leading-none`}
				>
					1
				</p>
				<MockupAsset
					className="top-[92.57%] left-[58.49%] aspect-[8/1] w-[1.29%] cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
					name="more"
				/>

				{topics.map((topic) => (
					<span
						key={topic.label}
						className={`${displayFont.className} absolute flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[2.105cqw] font-normal leading-[0.91] shadow-sm transition-[transform,filter,box-shadow] duration-200 ease-out hover:scale-[1.04] hover:shadow-md hover:brightness-105 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none ${topic.className}`}
					>
						{topic.label}
					</span>
				))}
			</div>
		</figure>
	);
}
