"use client";

import { Heart } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	getLikesStatus,
	likeArticle,
	unlikeArticle,
} from "@/features/likes/services/likes";
import type { LikesStatus } from "@/features/likes/types/like.types";

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const BURST_RADIUS = 16;

function LikeBurst() {
	return (
		<span
			className="pointer-events-none absolute inset-0 motion-reduce:hidden"
			aria-hidden="true"
		>
			{BURST_ANGLES.map((angle) => {
				const radians = (angle * Math.PI) / 180;
				const tx = Math.round(Math.cos(radians) * BURST_RADIUS);
				const ty = Math.round(Math.sin(radians) * BURST_RADIUS);
				const style = {
					"--tx": `${tx}px`,
					"--ty": `${ty}px`,
					animationDelay: `${(angle / 360) * 60}ms`,
				} as CSSProperties;

				return (
					<span
						key={angle}
						style={style}
						className="absolute top-1/2 left-1/2 size-1 animate-[ax-like-burst_0.55s_ease-out_forwards] rounded-full bg-ax-accent"
					/>
				);
			})}
		</span>
	);
}

export function LikeButton({ articleId }: { articleId: string }) {
	const [hasHydrated, setHasHydrated] = useState(false);
	const [status, setStatus] = useState<LikesStatus | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [justLiked, setJustLiked] = useState(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	useEffect(() => {
		let isActive = true;

		getLikesStatus(articleId)
			.then((result) => {
				if (isActive) setStatus(result);
			})
			.catch(() => {
				if (isActive) setStatus({ count: 0, likedByMe: false });
			});

		return () => {
			isActive = false;
		};
	}, [articleId]);

	async function handleToggle() {
		if (!status || isSubmitting) return;

		const previous = status;
		const wasLiked = previous.likedByMe;

		setIsSubmitting(true);
		setStatus({
			count: wasLiked ? previous.count - 1 : previous.count + 1,
			likedByMe: !wasLiked,
		});

		if (!wasLiked) {
			setJustLiked(true);
			setTimeout(() => setJustLiked(false), 550);
		}

		try {
			if (wasLiked) {
				await unlikeArticle(articleId);
			} else {
				await likeArticle(articleId);
			}
		} catch (error) {
			setStatus(previous);
			setJustLiked(false);
			toast.error(
				error instanceof Error
					? error.message
					: "Não foi possível atualizar a curtida",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	const displayedStatus = hasHydrated ? status : null;
	const isLiked = displayedStatus?.likedByMe ?? false;
	const isJustLiked = hasHydrated && justLiked;

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={!displayedStatus || isSubmitting}
			aria-pressed={isLiked}
			className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border bg-ax-surface px-4 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface disabled:cursor-not-allowed disabled:opacity-60 ${
				isLiked
					? "border-ax-ink-soft text-ax-accent"
					: "border-ax-line text-ax-ink-soft hover:border-ax-ink hover:text-ax-ink"
			}`}
		>
			<span className="relative inline-flex size-4.5 items-center justify-center">
				<Heart
					className={`size-4.5 ${
						isJustLiked
							? "animate-[ax-like-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none"
							: ""
					}`}
					fill={isLiked ? "currentColor" : "none"}
					strokeWidth={2}
					aria-hidden="true"
				/>

				{isJustLiked ? <LikeBurst /> : null}
			</span>

			<span aria-live="polite">
				{displayedStatus ? displayedStatus.count : " "}
			</span>

			<span className="sr-only">
				{isLiked ? "Descurtir artigo" : "Curtir artigo"}
			</span>
		</button>
	);
}
