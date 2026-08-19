"use client";

import { useEffect } from "react";

import {
	scrollRatio,
	writeReadingProgress,
} from "@/features/articles/reading-progress";

const WRITE_INTERVAL_MS = 800;

export function ReadingProgressTracker({ articleId }: { articleId: string }) {
	useEffect(() => {
		let lastWrite = 0;
		let latest: number | null = null;

		function handleScroll() {
			const ratio = scrollRatio(
				window.scrollY,
				window.innerHeight,
				document.documentElement.scrollHeight,
			);

			if (ratio === null) return;

			latest = ratio;

			const now = Date.now();
			if (now - lastWrite < WRITE_INTERVAL_MS) return;

			lastWrite = now;
			writeReadingProgress(articleId, ratio);
		}

		function flush() {
			if (latest !== null) writeReadingProgress(articleId, latest);
		}

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("pagehide", flush);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("pagehide", flush);
			flush();
		};
	}, [articleId]);

	return null;
}
