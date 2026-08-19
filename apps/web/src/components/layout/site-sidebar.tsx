"use client";

import { cn } from "@arxio/ui/lib/utils";
import {
	LoaderCircle,
	LogIn,
	LogOut,
	Newspaper,
	NotebookPen,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { ArxioMark, ArxioWordmark } from "@/components/layout/logo";
import { UserAvatar } from "@/components/user-avatar";
import { useAccount } from "@/features/auth/account-context";
import { signOut } from "@/features/auth/services/sign-out";

const ITEM_CLASS =
	"flex h-11 shrink-0 items-center gap-3.5 overflow-hidden rounded-2xl px-3 font-medium text-[15px] tracking-[-0.01em] transition-[width,background-color,color] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas";

const LABEL_CLASS =
	"truncate transition-opacity duration-200 ease-out motion-reduce:transition-none";

const INACTIVE_CLASS =
	"text-ax-ink-soft hover:bg-ax-surface/70 hover:text-ax-ink";

const ACTIVE_CLASS = "bg-ax-surface text-ax-ink shadow-ax-float";

const ICON_PROPS = { className: "size-5 shrink-0", strokeWidth: 1.75 } as const;

export function SiteSidebar({
	isOpen,
	onToggle,
}: {
	isOpen: boolean;
	onToggle: () => void;
}) {
	const account = useAccount();
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				"fixed inset-y-0 left-0 z-20 hidden flex-col gap-8 overflow-hidden px-4 py-6 transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex",
				isOpen ? "w-64" : "w-19",
			)}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
				className="relative flex h-9 w-56 shrink-0 cursor-pointer items-center px-3 text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas"
			>
				<ArxioMark
					className={cn(
						"h-8 w-5 transition-opacity duration-200 motion-reduce:transition-none",
						isOpen ? "opacity-0" : "opacity-100",
					)}
				/>

				<ArxioWordmark
					className={cn(
						"absolute left-3 h-8 w-auto transition-opacity duration-200 motion-reduce:transition-none",
						isOpen ? "opacity-100" : "opacity-0",
					)}
				/>
			</button>

			<nav
				aria-label="Atalhos da conta"
				className="flex min-h-0 flex-1 flex-col gap-1"
			>
				<SidebarLink
					href="/feed"
					label="Feed"
					isActive={pathname === "/feed" || pathname.startsWith("/artigos")}
					icon={<Newspaper {...ICON_PROPS} />}
					isOpen={isOpen}
				/>

				{account.status === "loading" ? <SidebarPlaceholder /> : null}

				{account.status === "authenticated" ? (
					<>
						<SidebarLink
							href="/meus-artigos"
							label="Meus artigos"
							isActive={pathname === "/meus-artigos"}
							icon={<NotebookPen {...ICON_PROPS} />}
							isOpen={isOpen}
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
							isOpen={isOpen}
						/>

						<div className="mt-auto pt-4">
							<SignOutButton isOpen={isOpen} />
						</div>
					</>
				) : null}

				{account.status === "unauthenticated" ? (
					<SidebarLink
						href="/login"
						label="Entrar"
						isActive={pathname === "/login"}
						icon={<LogIn {...ICON_PROPS} />}
						isOpen={isOpen}
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
	isOpen,
}: {
	href: Route | string;
	label: string;
	icon: ReactNode;
	isActive: boolean;
	isOpen: boolean;
}) {
	return (
		<Link
			href={href as Route}
			aria-current={isActive ? "page" : undefined}
			title={isOpen ? undefined : label}
			className={cn(
				ITEM_CLASS,
				isActive ? ACTIVE_CLASS : INACTIVE_CLASS,
				isOpen ? "w-56" : "w-11",
			)}
		>
			{icon}
			<span className={cn(LABEL_CLASS, isOpen ? "opacity-100" : "opacity-0")}>
				{label}
			</span>
		</Link>
	);
}

function SidebarPlaceholder() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-1">
			{[0, 1].map((index) => (
				<div key={index} className="flex h-11 w-56 items-center gap-3.5 px-3">
					<span className="size-5 shrink-0 animate-pulse rounded-full bg-ax-surface/70" />
					<span className="h-3 w-24 animate-pulse rounded bg-ax-surface/70" />
				</div>
			))}
		</div>
	);
}

function SignOutButton({ isOpen }: { isOpen: boolean }) {
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
			title={isOpen ? undefined : "Sair da conta"}
			className={cn(
				ITEM_CLASS,
				INACTIVE_CLASS,
				"cursor-pointer disabled:cursor-wait",
				isOpen ? "w-56" : "w-11",
			)}
		>
			{isSigningOut ? (
				<LoaderCircle
					className="size-5 shrink-0 animate-spin"
					strokeWidth={1.75}
					aria-hidden="true"
				/>
			) : (
				<LogOut {...ICON_PROPS} />
			)}
			<span className={cn(LABEL_CLASS, isOpen ? "opacity-100" : "opacity-0")}>
				{isSigningOut ? "Saindo..." : "Sair da conta"}
			</span>
		</button>
	);
}
