const STORAGE_PREFIX = "arxio:reading-progress:";

const MIN_TRACKED_PROGRESS = 0.05;
const COMPLETE_PROGRESS = 0.95;

export type ReadingProgress =
	| { status: "reading"; ratio: number }
	| { status: "read" };

export function readingProgressKey(articleId: string): string {
	return `${STORAGE_PREFIX}${articleId}`;
}

export function toReadingProgress(ratio: number): ReadingProgress | null {
	if (!Number.isFinite(ratio)) return null;
	if (ratio >= COMPLETE_PROGRESS) return { status: "read" };
	if (ratio < MIN_TRACKED_PROGRESS) return null;

	return { status: "reading", ratio };
}

export function readReadingProgress(articleId: string): ReadingProgress | null {
	try {
		const raw = window.localStorage.getItem(readingProgressKey(articleId));

		return raw === null ? null : toReadingProgress(Number(raw));
	} catch {
		return null;
	}
}

export function writeReadingProgress(articleId: string, ratio: number): void {
	try {
		const clamped = Math.min(1, Math.max(0, ratio));

		window.localStorage.setItem(
			readingProgressKey(articleId),
			clamped.toFixed(3),
		);
	} catch {
		// Sem localStorage disponivel o progresso simplesmente nao e registrado.
	}
}

export function scrollRatio(
	scrollY: number,
	viewportHeight: number,
	documentHeight: number,
): number | null {
	const scrollable = documentHeight - viewportHeight;

	if (scrollable <= 0) return null;

	return Math.min(1, Math.max(0, scrollY / scrollable));
}
