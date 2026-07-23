import { Instrument_Sans, Newsreader } from "next/font/google";

export const displayFont = Newsreader({
	variable: "--font-newsreader",
	subsets: ["latin"],
	style: ["normal", "italic"],
	axes: ["opsz"],
});

export const interfaceFont = Instrument_Sans({
	variable: "--font-instrument-sans",
	subsets: ["latin"],
	style: ["normal", "italic"],
});
