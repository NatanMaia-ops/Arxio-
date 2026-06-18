import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

import "../index.css";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta-sans",
	subsets: ["latin"],
	weight: ["500", "700", "800"],
});

const sourceSerif = Source_Serif_4({
	variable: "--font-source-serif",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
	title: "Arxio",
	description:
		"Uma rede acadêmica para compartilhar estudos, projetos e conhecimento.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${plusJakartaSans.variable} ${sourceSerif.variable} min-h-dvh antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
