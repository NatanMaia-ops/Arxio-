"use client";

import { cn } from "@arxio/ui/lib/utils";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
	type Content,
	type Editor,
	EditorContent,
	useEditor,
	useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import type { ComponentType } from "react";

import {
	ARTICLE_CONTENT_MAX_LENGTH,
	EMPTY_DOCUMENT,
	parseEditorDocument,
} from "@/features/articles/article-content";

import { articleProseClassName } from "./article-prose";

type ArticleEditorProps = {
	initialContent?: string;
	placeholder?: string;
	onChange: (content: string) => void;
};

type ToolbarAction = {
	id: string;
	label: string;
	icon: ComponentType<{ className?: string }>;
	isActive: (editor: Editor) => boolean;
	run: (editor: Editor) => void;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
	{
		id: "bold",
		label: "Negrito",
		icon: Bold,
		isActive: (editor) => editor.isActive("bold"),
		run: (editor) => editor.chain().focus().toggleBold().run(),
	},
	{
		id: "italic",
		label: "Itálico",
		icon: Italic,
		isActive: (editor) => editor.isActive("italic"),
		run: (editor) => editor.chain().focus().toggleItalic().run(),
	},
	{
		id: "heading-2",
		label: "Título de seção",
		icon: Heading2,
		isActive: (editor) => editor.isActive("heading", { level: 2 }),
		run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
	},
	{
		id: "heading-3",
		label: "Subtítulo de seção",
		icon: Heading3,
		isActive: (editor) => editor.isActive("heading", { level: 3 }),
		run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
	},
	{
		id: "bullet-list",
		label: "Lista",
		icon: List,
		isActive: (editor) => editor.isActive("bulletList"),
		run: (editor) => editor.chain().focus().toggleBulletList().run(),
	},
	{
		id: "ordered-list",
		label: "Lista numerada",
		icon: ListOrdered,
		isActive: (editor) => editor.isActive("orderedList"),
		run: (editor) => editor.chain().focus().toggleOrderedList().run(),
	},
	{
		id: "blockquote",
		label: "Citação",
		icon: Quote,
		isActive: (editor) => editor.isActive("blockquote"),
		run: (editor) => editor.chain().focus().toggleBlockquote().run(),
	},
];

export function ArticleEditor({
	initialContent,
	placeholder = "Conte sua história...",
	onChange,
}: ArticleEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ heading: { levels: [2, 3] } }),
			Placeholder.configure({ placeholder }),
			CharacterCount.configure({
				limit: ARTICLE_CONTENT_MAX_LENGTH,
				mode: "textSize",
				autoTrim: false,
			}),
		],
		content: (initialContent
			? (parseEditorDocument(initialContent) ?? initialContent)
			: EMPTY_DOCUMENT) as Content,
		editorProps: {
			attributes: {
				class: cn(
					articleProseClassName,
					"min-h-100 focus:outline-none",
					"[&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-ax-placeholder [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
				),
			},
		},
		onUpdate: ({ editor: instance }) => {
			onChange(JSON.stringify(instance.getJSON()));
		},
	});

	const activeActions = useEditorState({
		editor,
		selector: ({ editor: instance }) =>
			instance
				? TOOLBAR_ACTIONS.filter((action) => action.isActive(instance)).map(
						(action) => action.id,
					)
				: [],
	});
	const characterCount = useEditorState({
		editor,
		selector: ({ editor: instance }) =>
			instance?.storage.characterCount.characters() ?? 0,
	});

	if (!editor) {
		return <div className="min-h-100" aria-hidden="true" />;
	}
	const currentCharacterCount = characterCount ?? 0;

	return (
		<div className="flex flex-col gap-4">
			<div
				role="toolbar"
				aria-label="Formatação do texto"
				className="sticky top-16 z-1 flex flex-wrap items-center gap-0.5 border-ax-line border-b bg-ax-surface py-2 sm:top-18 sm:gap-1 sm:py-3"
			>
				{TOOLBAR_ACTIONS.map((action) => {
					const Icon = action.icon;
					const isActive = activeActions?.includes(action.id) ?? false;

					return (
						<button
							key={action.id}
							type="button"
							aria-label={action.label}
							aria-pressed={isActive}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => action.run(editor)}
							className={cn(
								"flex size-11 items-center justify-center rounded-full text-ax-ink-soft transition-colors hover:bg-ax-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface",
								isActive && "bg-ax-ink text-ax-on-ink hover:bg-ax-ink",
							)}
						>
							<Icon className="size-4.5" />
						</button>
					);
				})}
			</div>

			<EditorContent editor={editor} />

			<p
				className={cn(
					"text-right text-ax-meta text-xs",
					currentCharacterCount >= ARTICLE_CONTENT_MAX_LENGTH &&
						"text-destructive",
				)}
			>
				{currentCharacterCount.toLocaleString("pt-BR")} /{" "}
				{ARTICLE_CONTENT_MAX_LENGTH.toLocaleString("pt-BR")} caracteres
			</p>
		</div>
	);
}
