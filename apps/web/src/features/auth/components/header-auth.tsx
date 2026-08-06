"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { UserMenu } from "@/features/auth/components/user-menu";
import type { AuthSession } from "@/features/auth/services/auth-api";
import { getSession } from "@/features/auth/services/get-session";

type AuthState =
	| { status: "loading" }
	| { status: "authenticated"; session: AuthSession }
	| { status: "unauthenticated" };

export function HeaderAuth() {
	const [state, setState] = useState<AuthState>({ status: "loading" });

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (!isActive) return;

				setState(
					session
						? { status: "authenticated", session }
						: { status: "unauthenticated" },
				);
			})
			.catch(() => {
				if (isActive) setState({ status: "unauthenticated" });
			});

		return () => {
			isActive = false;
		};
	}, []);

	return (
		<div className="flex h-9.5 min-w-9 shrink-0 items-center justify-end">
			{state.status === "authenticated" && (
				<UserMenu
					userId={state.session.user.id}
					name={state.session.user.name}
				/>
			)}

			{state.status === "unauthenticated" && (
				<Link
					href={{ pathname: "/login" }}
					className="flex h-9.5 shrink-0 items-center rounded-lg border border-ax-line-3 px-3.5 font-medium text-ax-ink text-sm transition-colors hover:bg-ax-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
				>
					Entrar
				</Link>
			)}
		</div>
	);
}
