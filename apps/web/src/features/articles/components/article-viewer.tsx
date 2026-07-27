"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { parseEditorDocument } from "@/features/articles/article-content";

import { articleProseClassName } from "./article-prose";

export function ArticleViewer({ content }: { content: string }) {
	const document = parseEditorDocument(content);

	const editor = useEditor(
		{
			immediatelyRender: false,
			editable: false,
			extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
			content: document,
			editorProps: { attributes: { class: articleProseClassName } },
		},
		[content],
	);

	if (!document) {
		return (
			<div className={`${articleProseClassName} whitespace-pre-wrap`}>
				{content}
			</div>
		);
	}

	if (!editor) {
		return <div className="min-h-40" aria-hidden="true" />;
	}

	return <EditorContent editor={editor} />;
}
