import type { Metadata } from "next";

import "../index.css";
import { displayFont, interfaceFont } from "./fonts";
import { Providers } from "./providers";

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
				className={`${interfaceFont.variable} ${displayFont.variable} ${interfaceFont.className} min-h-dvh antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
