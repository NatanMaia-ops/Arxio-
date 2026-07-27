"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { getSession } from "@/features/auth/services/get-session";

export function RequireAuth({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (!isActive) return;

				if (!session) {
					router.replace("/login");
					return;
				}

				setIsAuthenticated(true);
			})
			.catch(() => {
				if (isActive) router.replace("/login");
			});

		return () => {
			isActive = false;
		};
	}, [router]);

	if (!isAuthenticated) {
		return (
			<div className="min-h-dvh bg-white" role="status">
				<span className="sr-only">Verificando sessão...</span>
			</div>
		);
	}

	return children;
}
