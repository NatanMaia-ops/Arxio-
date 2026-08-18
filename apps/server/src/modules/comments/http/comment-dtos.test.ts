import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { COMMENT_CONTENT_MAX_LENGTH } from "./dtos/comment_content.dto";
import { createCommentSchema } from "./dtos/create_comment.dto";
import { updateCommentSchema } from "./dtos/update_comment.dto";

describe("Comment content validation", () => {
	it("accepts 300 characters and rejects 301 for comments and replies", () => {
		const contentAtLimit = "x".repeat(COMMENT_CONTENT_MAX_LENGTH);
		const contentAboveLimit = "x".repeat(COMMENT_CONTENT_MAX_LENGTH + 1);

		assert.equal(
			createCommentSchema.safeParse({ content: contentAtLimit }).success,
			true,
		);
		assert.equal(
			createCommentSchema.safeParse({
				content: contentAtLimit,
				parentId: "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f",
			}).success,
			true,
		);
		assert.equal(
			createCommentSchema.safeParse({ content: contentAboveLimit }).success,
			false,
		);
	});

	it("accepts 300 characters and rejects 301 when updating a comment", () => {
		assert.equal(
			updateCommentSchema.safeParse({
				content: "x".repeat(COMMENT_CONTENT_MAX_LENGTH),
			}).success,
			true,
		);
		assert.equal(
			updateCommentSchema.safeParse({
				content: "x".repeat(COMMENT_CONTENT_MAX_LENGTH + 1),
			}).success,
			false,
		);
	});

	it("trims comment content and rejects blank values", () => {
		const parsed = createCommentSchema.safeParse({ content: "  Comentario  " });

		assert.equal(parsed.success, true);
		if (parsed.success) assert.equal(parsed.data.content, "Comentario");
		assert.equal(
			createCommentSchema.safeParse({ content: "   " }).success,
			false,
		);
	});
});
