import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { AuthorSummary } from "@/features/articles/types/article.types";
import type { FlatCommentNode } from "@/features/comments/comment-tree";

import { CommentItem } from "./comment-item";

const author: AuthorSummary = {
	id: "author-id",
	name: "Autor do comentário",
	avatarUrl: null,
};

describe("CommentItem", () => {
	it("wraps continuous text while preserving the complete comment", () => {
		const content = "x".repeat(300);
		const node: FlatCommentNode = {
			id: "comment-id",
			articleId: "article-id",
			authorId: author.id,
			parentId: null,
			content,
			createdAt: new Date("2026-08-18T12:00:00.000Z"),
			updatedAt: new Date("2026-08-18T12:00:00.000Z"),
			depth: 0,
		};

		const markup = renderToStaticMarkup(
			createElement(CommentItem, {
				node,
				authors: new Map([[author.id, author]]),
				currentUserId: null,
				onReply: async () => undefined,
				onUpdate: async () => undefined,
				onDelete: async () => undefined,
			}),
		);

		assert.match(markup, /whitespace-pre-wrap break-words/);
		assert.match(markup, new RegExp(content));
	});
});
