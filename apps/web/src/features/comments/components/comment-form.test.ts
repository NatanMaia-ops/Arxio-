import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { COMMENT_CONTENT_MAX_LENGTH } from "../schemas/comment.schema";

import { CommentForm } from "./comment-form";

describe("CommentForm", () => {
	it("declares the comment limit and always displays the character counter", () => {
		const initialValue = "Comentario";
		const markup = renderToStaticMarkup(
			createElement(CommentForm, {
				initialValue,
				onSubmit: async () => undefined,
			}),
		);

		assert.match(
			markup,
			new RegExp(`maxLength="${COMMENT_CONTENT_MAX_LENGTH}"`),
		);
		assert.match(
			markup,
			new RegExp(`${initialValue.length}/${COMMENT_CONTENT_MAX_LENGTH}`),
		);
	});
});
