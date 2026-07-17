import { Inter, Newsreader } from "next/font/google";

export const interfaceFont = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

export const displayFont = Newsreader({
	variable: "--font-newsreader",
	subsets: ["latin"],
	weight: ["500", "600", "700"],
});
