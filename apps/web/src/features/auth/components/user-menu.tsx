"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@arxio/ui/components/dropdown-menu";
import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { signOut } from "@/features/auth/services/sign-out";

export function UserMenu() {
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		if (isSigningOut) return;

		setIsSigningOut(true);

		try {
			const loginUrl = new URL("/login", window.location.origin).toString();
			const redirectUrl = await signOut(loginUrl);
			window.location.assign(redirectUrl);
		} catch {
			setIsSigningOut(false);
			toast.error("Não foi possível sair. Tente novamente.");
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Abrir menu do usuário"
				className="size-10 shrink-0 rounded-full bg-ax-fill-hover outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2"
			/>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-40 rounded-lg bg-ax-surface p-1 text-ax-ink"
			>
				<DropdownMenuItem
					onClick={handleSignOut}
					disabled={isSigningOut}
					className="rounded-md px-3 py-2 text-sm"
				>
					{isSigningOut ? (
						<LoaderCircle className="animate-spin" aria-hidden="true" />
					) : (
						<LogOut aria-hidden="true" />
					)}
					{isSigningOut ? "Saindo..." : "Sair"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
