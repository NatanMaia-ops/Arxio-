"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { UserMenu } from "@/features/auth/components/user-menu";
import { getSession } from "@/features/auth/services/get-session";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function HeaderAuth() {
	const [status, setStatus] = useState<AuthStatus>("loading");

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (isActive) {
					setStatus(session ? "authenticated" : "unauthenticated");
				}
			})
			.catch(() => {
				if (isActive) setStatus("unauthenticated");
			});

		return () => {
			isActive = false;
		};
	}, []);

	return (
		<div className="flex w-17 shrink-0 justify-end">
			{status === "authenticated" && <UserMenu />}

			{status === "unauthenticated" && (
				<Link
					href="/login"
					className="rounded-full border border-black px-4.5 py-2.5 font-medium text-black text-sm transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
				>
					Entrar
				</Link>
			)}

			{status === "loading" && <span className="h-10" aria-hidden="true" />}
		</div>
	);
}
