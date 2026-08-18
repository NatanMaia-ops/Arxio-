export const ARTICLE_CONTENT_MAX_LENGTH = 30_000;
export const ARTICLE_REQUEST_BODY_LIMIT = "1mb";

type ArticleContentNode = {
	type?: string;
	text?: string;
	content?: ArticleContentNode[];
};

function countNodeCharacters(node: ArticleContentNode): number {
	if (typeof node.text === "string") return node.text.length;
	if (Array.isArray(node.content)) {
		return node.content.reduce(
			(total, child) => total + countNodeCharacters(child),
			0,
		);
	}

	return node.type === "hardBreak" ? 1 : 0;
}

export function countArticleContentCharacters(content: string): number {
	const normalized = content.trim();

	try {
		const parsed: unknown = JSON.parse(normalized);

		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"type" in parsed &&
			parsed.type === "doc"
		) {
			return countNodeCharacters(parsed as ArticleContentNode);
		}
	} catch {
		return normalized.length;
	}

	return normalized.length;
}
