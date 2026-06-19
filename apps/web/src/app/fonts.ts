import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

export const interfaceFont = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta-sans",
	subsets: ["latin"],
	weight: ["500", "700", "800"],
});

export const displayFont = Source_Serif_4({
	variable: "--font-source-serif",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
});
