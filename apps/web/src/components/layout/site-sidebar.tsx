"use client";

import { cn } from "@arxio/ui/lib/utils";
import { FileText, House, LoaderCircle, LogIn, LogOut } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { ArxioWordmark } from "@/components/layout/logo";
import { UserAvatar } from "@/components/user-avatar";
import { useAccount } from "@/features/auth/account-context";
import { signOut } from "@/features/auth/services/sign-out";

const ITEM_CLASS =
	"flex min-h-11 items-center gap-3 rounded-2xl px-3 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas";

const INACTIVE_CLASS =
	"text-ax-ink-soft hover:bg-ax-surface/70 hover:text-ax-ink";

const ACTIVE_CLASS = "bg-ax-surface text-ax-ink shadow-ax-float";

export function SiteSidebar() {
	const account = useAccount();
	const pathname = usePathname();

	return (
		<aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-9 px-5 py-6 lg:flex">
			<Link
				href={{ pathname: "/feed" }}
				aria-label="Arxio — ir para o feed"
				className="flex shrink-0 items-center rounded-md px-3 text-ax-ink transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas"
			>
				<ArxioWordmark className="h-9 w-auto" />
			</Link>

			<nav
				aria-label="Atalhos da conta"
				className="flex min-h-0 flex-1 flex-col gap-1"
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

						<div className="mt-auto pt-4">
							<SignOutButton />
						</div>
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
			className={cn(ITEM_CLASS, isActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
		>
			{icon}
			{label}
		</Link>
	);
}

function SidebarPlaceholder() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-1">
			{[0, 1].map((index) => (
				<div key={index} className="flex min-h-11 items-center gap-3 px-3">
					<span className="size-5 shrink-0 animate-pulse rounded-full bg-ax-surface/70" />
					<span className="h-3 w-24 animate-pulse rounded bg-ax-surface/70" />
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
				INACTIVE_CLASS,
				"w-full cursor-pointer disabled:cursor-wait",
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
