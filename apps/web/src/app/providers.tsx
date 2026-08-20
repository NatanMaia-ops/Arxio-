"use client";

import { Toaster } from "@arxio/ui/components/sonner";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { AccountProvider } from "@/features/auth/account-context";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			disableTransitionOnChange
		>
			<AccountProvider>{children}</AccountProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
