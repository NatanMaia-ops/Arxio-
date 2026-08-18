import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	COMMENT_CONTENT_MAX_LENGTH,
	commentInputSchema,
} from "./comment.schema";

describe("commentInputSchema", () => {
	it("accepts 300 characters and rejects 301", () => {
		assert.equal(
			commentInputSchema.safeParse({
				content: "x".repeat(COMMENT_CONTENT_MAX_LENGTH),
			}).success,
			true,
		);
		assert.equal(
			commentInputSchema.safeParse({
				content: "x".repeat(COMMENT_CONTENT_MAX_LENGTH + 1),
			}).success,
			false,
		);
	});

	it("trims comment content and rejects blank values", () => {
		const parsed = commentInputSchema.safeParse({ content: "  Comentário  " });

		assert.equal(parsed.success, true);
		if (parsed.success) assert.equal(parsed.data.content, "Comentário");
		assert.equal(
			commentInputSchema.safeParse({ content: "   " }).success,
			false,
		);
	});
});
