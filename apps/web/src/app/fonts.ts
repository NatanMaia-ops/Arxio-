import { Familjen_Grotesk, Newsreader } from "next/font/google";

export const displayFont = Newsreader({
	variable: "--font-display",
	subsets: ["latin"],
	style: ["normal", "italic"],
	axes: ["opsz"],
});

export const interfaceFont = Familjen_Grotesk({
	variable: "--font-interface",
	subsets: ["latin"],
	style: ["normal", "italic"],
});
