"use client";

import { useEffect, useState } from "react";

import {
	type ReadingProgress,
	readReadingProgress,
} from "@/features/articles/reading-progress";

export function ArticleCardProgress({ articleId }: { articleId: string }) {
	const [progress, setProgress] = useState<ReadingProgress | null>(null);

	useEffect(() => {
		setProgress(readReadingProgress(articleId));
	}, [articleId]);

	if (progress === null) return null;

	if (progress.status === "read") {
		return (
			<>
				<span aria-hidden="true" className="text-ax-line-3">
					·
				</span>
				<span className="text-ax-meta">Lido</span>
			</>
		);
	}

	const percent = Math.round(progress.ratio * 100);

	return (
		<>
			<span aria-hidden="true" className="text-ax-line-3">
				·
			</span>

			<span className="flex items-center gap-2">
				<span
					aria-hidden="true"
					className="h-1 w-14 overflow-hidden rounded-full bg-ax-fill-hover"
				>
					<span
						className="block h-full rounded-full bg-ax-ink"
						style={{ width: `${percent}%` }}
					/>
				</span>
				{percent}% lido
			</span>
		</>
	);
}
