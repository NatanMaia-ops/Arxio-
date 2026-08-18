"use client";

import { cn } from "@arxio/ui/lib/utils";
import { useState } from "react";

import { getInitials } from "@/lib/initials";

function safeImageUrl(value: string | null | undefined): string | null {
	if (!value?.trim()) return null;
	try {
		const url = new URL(value);
		return url.protocol === "http:" ||
			url.protocol === "https:" ||
			url.protocol === "blob:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export function UserAvatar({
	name,
	src,
	className,
}: {
	name: string | null;
	src?: string | null;
	className?: string;
}) {
	const imageUrl = safeImageUrl(src);
	const [failedUrl, setFailedUrl] = useState<string | null>(null);

	const showImage = imageUrl && imageUrl !== failedUrl;

	return (
		<span
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ax-fill-hover font-semibold text-ax-ink uppercase ring-1 ring-ax-line",
				className,
			)}
			aria-hidden="true"
		>
			<span>{name ? getInitials(name) : "?"}</span>
			{showImage ? (
				// biome-ignore lint/performance/noImgElement: os avatares podem vir de hosts externos dinâmicos.
				<img
					src={imageUrl}
					alt=""
					className="absolute inset-0 size-full object-cover"
					referrerPolicy="no-referrer"
					onError={() => setFailedUrl(imageUrl)}
				/>
			) : null}
		</span>
	);
}
