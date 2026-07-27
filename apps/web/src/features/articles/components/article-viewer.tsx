import type { ReactNode } from "react";

import {
	type EditorNode,
	parseEditorDocument,
} from "@/features/articles/article-content";

import { articleProseClassName } from "./article-prose";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function safeHref(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;

	try {
		const url = new URL(value, "https://arxio.invalid");

		return ALLOWED_PROTOCOLS.has(url.protocol) ? value : undefined;
	} catch {
		return undefined;
	}
}

function renderText(node: EditorNode, key: string): ReactNode {
	let element: ReactNode = node.text ?? "";

	for (const mark of node.marks ?? []) {
		switch (mark.type) {
			case "bold":
				element = <strong>{element}</strong>;
				break;
			case "italic":
				element = <em>{element}</em>;
				break;
			case "strike":
				element = <s>{element}</s>;
				break;
			case "underline":
				element = <u>{element}</u>;
				break;
			case "code":
				element = <code>{element}</code>;
				break;
			case "link": {
				const href = safeHref(mark.attrs?.href);

				element = href ? (
					<a href={href} rel="noopener noreferrer nofollow" target="_blank">
						{element}
					</a>
				) : (
					element
				);
				break;
			}
			default:
				break;
		}
	}

	return <span key={key}>{element}</span>;
}

function renderChildren(node: EditorNode, key: string): ReactNode[] {
	return (node.content ?? []).map((child, index) =>
		renderNode(child, `${key}-${index}`),
	);
}

function renderNode(node: EditorNode, key: string): ReactNode {
	if (typeof node.text === "string") return renderText(node, key);

	const children = renderChildren(node, key);

	switch (node.type) {
		case "paragraph":
			return <p key={key}>{children}</p>;
		case "heading": {
			const level = node.attrs?.level;

			if (level === 3) return <h3 key={key}>{children}</h3>;

			return <h2 key={key}>{children}</h2>;
		}
		case "bulletList":
			return <ul key={key}>{children}</ul>;
		case "orderedList":
			return <ol key={key}>{children}</ol>;
		case "listItem":
			return <li key={key}>{children}</li>;
		case "blockquote":
			return <blockquote key={key}>{children}</blockquote>;
		case "codeBlock":
			return (
				<pre key={key}>
					<code>{children}</code>
				</pre>
			);
		case "horizontalRule":
			return <hr key={key} />;
		case "hardBreak":
			return <br key={key} />;
		default:
			return children.length > 0 ? <div key={key}>{children}</div> : null;
	}
}

export function ArticleViewer({ content }: { content: string }) {
	const document = parseEditorDocument(content);

	if (!document) {
		return (
			<div className={`${articleProseClassName} whitespace-pre-wrap`}>
				{content}
			</div>
		);
	}

	return (
		<div className={articleProseClassName}>
			{renderChildren(document, "node")}
		</div>
	);
}
