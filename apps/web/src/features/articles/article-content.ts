const WORDS_PER_MINUTE = 200;
const EXCERPT_MAX_LENGTH = 180;

export type EditorNode = {
	type?: string;
	text?: string;
	content?: EditorNode[];
};

export type EditorDocument = EditorNode & { type: "doc" };

export const EMPTY_DOCUMENT: EditorDocument = {
	type: "doc",
	content: [{ type: "paragraph" }],
};

export function parseEditorDocument(content: string): EditorDocument | null {
	let parsed: unknown;

	try {
		parsed = JSON.parse(content);
	} catch {
		return null;
	}

	if (typeof parsed !== "object" || parsed === null) return null;
	if (!("type" in parsed) || parsed.type !== "doc") return null;

	return parsed as EditorDocument;
}

function nodeToText(node: EditorNode): string {
	if (typeof node.text === "string") return node.text;
	if (!Array.isArray(node.content)) return "";

	const text = node.content.map(nodeToText).join("");

	return node.type === "doc" ? text : `${text}\n`;
}

export function extractPlainText(content: string): string {
	const document = parseEditorDocument(content);

	if (!document) return content.replace(/\s+/g, " ").trim();

	return nodeToText(document).replace(/\s+/g, " ").trim();
}

export function isEmptyContent(content: string): boolean {
	return extractPlainText(content).length === 0;
}

export function extractExcerpt(
	content: string,
	maxLength: number = EXCERPT_MAX_LENGTH,
): string {
	const text = extractPlainText(content);

	if (text.length <= maxLength) return text;

	const truncated = text.slice(0, maxLength + 1);
	const lastSpace = truncated.lastIndexOf(" ");
	const cut =
		lastSpace > 0 ? truncated.slice(0, lastSpace) : text.slice(0, maxLength);

	return `${cut.trimEnd()}…`;
}

export function estimateReadTimeMinutes(content: string): number {
	const words = extractPlainText(content).split(" ").filter(Boolean).length;

	if (words === 0) return 1;

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
