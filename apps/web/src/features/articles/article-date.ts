const MONTHS = [
	"jan",
	"fev",
	"mar",
	"abr",
	"mai",
	"jun",
	"jul",
	"ago",
	"set",
	"out",
	"nov",
	"dez",
] as const;

const RELATIVE_LIMIT_DAYS = 7;

export function formatAbsoluteDate(date: Date): string {
	return `${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

export function formatPublishedDate(
	date: Date,
	reference = new Date(),
): string {
	const hours = Math.floor(
		(reference.getTime() - date.getTime()) / (60 * 60 * 1000),
	);

	if (hours < 0) return formatAbsoluteDate(date);
	if (hours < 1) return "agora há pouco";
	if (hours < 24) return `há ${hours} h`;

	const days = Math.floor(hours / 24);

	if (days === 1) return "ontem";
	if (days < RELATIVE_LIMIT_DAYS) return `há ${days} dias`;

	return formatAbsoluteDate(date);
}
