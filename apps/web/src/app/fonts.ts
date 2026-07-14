import { Inter, Newsreader } from "next/font/google";

export const interfaceFont = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["400", "500"],
});

export const displayFont = Newsreader({
	variable: "--font-newsreader",
	subsets: ["latin"],
	weight: ["600", "700"],
});
