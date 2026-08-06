"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@arxio/ui/components/dropdown-menu";
import { LoaderCircle, LogOut, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { signOut } from "@/features/auth/services/sign-out";
import { getInitials } from "@/lib/initials";

export function UserMenu({
	userId,
	name,
}: {
	userId: string;
	name: string | null;
}) {
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
				aria-label={name ? `Abrir menu de ${name}` : "Abrir menu da conta"}
				className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ax-fill-hover font-semibold text-ax-ink text-xs uppercase outline-none transition-shadow hover:ring-2 hover:ring-ax-line-3 focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
			>
				<span aria-hidden="true">{name ? getInitials(name) : "?"}</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-44 rounded-lg bg-ax-surface p-1 text-ax-ink"
			>
				{name ? (
					<p className="truncate px-3 py-2 font-medium text-ax-meta text-xs">
						{name}
					</p>
				) : null}

				<DropdownMenuItem
					render={<Link href={`/perfil/${userId}` as Route} />}
					className="cursor-pointer rounded-md px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-inset"
				>
					<UserRound aria-hidden="true" />
					Meu perfil
				</DropdownMenuItem>

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
