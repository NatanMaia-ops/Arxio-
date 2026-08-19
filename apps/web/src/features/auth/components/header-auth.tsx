"use client";

import Link from "next/link";

import { useAccount } from "@/features/auth/account-context";
import { UserMenu } from "@/features/auth/components/user-menu";

export function HeaderAuth() {
	const account = useAccount();

	if (account.status === "loading") return null;

	return (
		<div className="flex h-10 shrink-0 items-center justify-end lg:hidden">
			{account.status === "authenticated" ? (
				<UserMenu
					userId={account.userId}
					name={account.name}
					avatarUrl={account.avatarUrl}
				/>
			) : (
				<Link
					href={{ pathname: "/login" }}
					className="flex h-10 shrink-0 items-center rounded-full border border-ax-line-3 px-4 font-medium text-ax-ink text-sm transition-colors hover:bg-ax-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Entrar
				</Link>
			)}
		</div>
	);
}
