"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSession } from "@/features/auth/services/get-session";

export function ProfileOwnerActions({ profileId }: { profileId: string }) {
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		let isActive = true;

		getSession()
			.then((session) => {
				if (isActive) setIsOwner(session?.user.id === profileId);
			})
			.catch(() => {
				if (isActive) setIsOwner(false);
			});

		return () => {
			isActive = false;
		};
	}, [profileId]);

	if (!isOwner) return null;

	return (
		<Link
			href="/perfil/editar"
			className="inline-flex shrink-0 items-center rounded-full border border-ax-line px-4 py-2 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-canvas sm:ml-auto"
		>
			Editar perfil
		</Link>
	);
}
