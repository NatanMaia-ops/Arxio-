"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { getSession } from "@/features/auth/services/get-session";

export function LoginGuard({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [isCheckingSession, setIsCheckingSession] = useState(true);

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (!isActive) return;

				if (session) {
					router.replace("/feed");
					return;
				}

				setIsCheckingSession(false);
			})
			.catch(() => {
				if (isActive) setIsCheckingSession(false);
			});

		return () => {
			isActive = false;
		};
	}, [router]);

	if (isCheckingSession) {
		return (
			<div className="min-h-dvh bg-white" role="status">
				<span className="sr-only">Verificando sessão...</span>
			</div>
		);
	}

	return children;
}
