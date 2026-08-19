"use client";

import { cn } from "@arxio/ui/lib/utils";
import { FileText, House, LoaderCircle, LogIn, LogOut } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { useAccount } from "@/features/auth/account-context";
import { signOut } from "@/features/auth/services/sign-out";

const ITEM_CLASS =
	"flex min-h-11 items-center gap-3 rounded-2xl px-3 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface";

export function SiteSidebar() {
	const account = useAccount();
	const pathname = usePathname();

	return (
		<aside className="hidden w-60 shrink-0 lg:block">
			<nav
				aria-label="Atalhos da conta"
				className="sticky top-24 flex flex-col gap-1 rounded-3xl bg-ax-surface p-3 shadow-ax-float"
			>
				<SidebarLink
					href="/feed"
					label="Feed"
					isActive={pathname === "/feed" || pathname.startsWith("/artigos")}
					icon={<House className="size-5 shrink-0" aria-hidden="true" />}
				/>

				{account.status === "loading" ? <SidebarPlaceholder /> : null}

				{account.status === "authenticated" ? (
					<>
						<SidebarLink
							href="/meus-artigos"
							label="Meus artigos"
							isActive={pathname === "/meus-artigos"}
							icon={<FileText className="size-5 shrink-0" aria-hidden="true" />}
						/>

						<SidebarLink
							href={`/perfil/${account.userId}` as Route}
							label="Meu perfil"
							isActive={pathname === `/perfil/${account.userId}`}
							icon={
								<UserAvatar
									name={account.name}
									src={account.avatarUrl}
									className="size-5 shrink-0 text-[9px] ring-0"
								/>
							}
						/>

						<span
							aria-hidden="true"
							className="my-1 h-px shrink-0 bg-ax-line"
						/>

						<SignOutButton />
					</>
				) : null}

				{account.status === "unauthenticated" ? (
					<SidebarLink
						href="/login"
						label="Entrar"
						isActive={pathname === "/login"}
						icon={<LogIn className="size-5 shrink-0" aria-hidden="true" />}
					/>
				) : null}
			</nav>
		</aside>
	);
}

function SidebarLink({
	href,
	label,
	icon,
	isActive,
}: {
	href: Route | string;
	label: string;
	icon: ReactNode;
	isActive: boolean;
}) {
	return (
		<Link
			href={href as Route}
			aria-current={isActive ? "page" : undefined}
			className={cn(
				ITEM_CLASS,
				isActive
					? "bg-ax-fill text-ax-ink"
					: "text-ax-ink-soft hover:bg-ax-fill/70 hover:text-ax-ink",
			)}
		>
			{icon}
			{label}
		</Link>
	);
}

function SidebarPlaceholder() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-1">
			{[0, 1, 2].map((index) => (
				<div key={index} className="flex min-h-11 items-center gap-3 px-3">
					<span className="size-5 shrink-0 animate-pulse rounded-full bg-ax-fill" />
					<span className="h-3 w-24 animate-pulse rounded bg-ax-fill" />
				</div>
			))}
		</div>
	);
}

function SignOutButton() {
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
		<button
			type="button"
			onClick={handleSignOut}
			disabled={isSigningOut}
			className={cn(
				ITEM_CLASS,
				"cursor-pointer text-ax-ink-soft hover:bg-ax-fill/70 hover:text-ax-ink disabled:cursor-wait",
			)}
		>
			{isSigningOut ? (
				<LoaderCircle
					className="size-5 shrink-0 animate-spin"
					aria-hidden="true"
				/>
			) : (
				<LogOut className="size-5 shrink-0" aria-hidden="true" />
			)}
			{isSigningOut ? "Saindo..." : "Sair da conta"}
		</button>
	);
}
