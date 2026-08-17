import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	buildCommentTree,
	collectDescendantIds,
	flattenCommentTree,
} from "./comment-tree";
import type { Comment } from "./types/comment.types";

function createComment(overrides: Partial<Comment> & { id: string }): Comment {
	return {
		id: overrides.id,
		articleId: "article-1",
		authorId: "author-1",
		parentId: overrides.parentId ?? null,
		content: overrides.content ?? "Comentario",
		createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z"),
	};
}

describe("buildCommentTree", () => {
	it("returns root comments without children", () => {
		const comments = [createComment({ id: "a" }), createComment({ id: "b" })];

		const tree = buildCommentTree(comments);

		assert.equal(tree.length, 2);
		assert.deepEqual(tree[0]?.children, []);
	});

	it("nests replies under their parent", () => {
		const comments = [
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
			createComment({ id: "c", parentId: "a" }),
		];

		const tree = buildCommentTree(comments);

		assert.equal(tree.length, 1);
		assert.deepEqual(
			tree[0]?.children.map((c) => c.id),
			["b", "c"],
		);
	});

	it("nests multiple levels of replies", () => {
		const comments = [
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
			createComment({ id: "c", parentId: "b" }),
		];

		const tree = buildCommentTree(comments);

		assert.equal(tree[0]?.children[0]?.children[0]?.id, "c");
	});

	it("treats a comment that references itself as a root", () => {
		const comments = [createComment({ id: "a", parentId: "a" })];

		const tree = buildCommentTree(comments);

		assert.equal(tree.length, 1);
		assert.deepEqual(tree[0]?.children, []);
	});

	it("breaks a mutual cycle between two comments without infinite recursion", () => {
		const comments = [
			createComment({ id: "a", parentId: "b" }),
			createComment({ id: "b", parentId: "a" }),
		];

		const tree = buildCommentTree(comments);

		assert.equal(tree.length, 2);
		assert.deepEqual(tree[0]?.children, []);
		assert.deepEqual(tree[1]?.children, []);
	});

	it("treats a reply to a missing parent as a root", () => {
		const comments = [createComment({ id: "b", parentId: "missing" })];

		const tree = buildCommentTree(comments);

		assert.equal(tree.length, 1);
		assert.equal(tree[0]?.id, "b");
	});
});

describe("flattenCommentTree", () => {
	it("assigns depth 0 to root comments", () => {
		const tree = buildCommentTree([createComment({ id: "a" })]);

		assert.deepEqual(
			flattenCommentTree(tree).map((c) => c.depth),
			[0],
		);
	});

	it("assigns increasing depth to each nesting level", () => {
		const tree = buildCommentTree([
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
			createComment({ id: "c", parentId: "b" }),
		]);

		assert.deepEqual(
			flattenCommentTree(tree).map((c) => [c.id, c.depth]),
			[
				["a", 0],
				["b", 1],
				["c", 2],
			],
		);
	});

	it("keeps increasing depth for a long reply chain instead of resetting", () => {
		const comments = Array.from({ length: 10 }, (_, index) =>
			createComment({
				id: `c${index}`,
				parentId: index === 0 ? null : `c${index - 1}`,
			}),
		);

		const flat = flattenCommentTree(buildCommentTree(comments));

		assert.deepEqual(
			flat.map((c) => c.depth),
			Array.from({ length: 10 }, (_, index) => index),
		);
	});

	it("does not nest the DOM-affecting fields, returning a flat array without children", () => {
		const tree = buildCommentTree([
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
		]);

		const flat = flattenCommentTree(tree);

		for (const node of flat) {
			assert.ok(!("children" in node));
		}
	});
});

describe("collectDescendantIds", () => {
	it("returns an empty list for a comment without replies", () => {
		const comments = [createComment({ id: "a" })];

		assert.deepEqual(collectDescendantIds(comments, "a"), []);
	});

	it("collects direct replies", () => {
		const comments = [
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
			createComment({ id: "c", parentId: "a" }),
		];

		const descendants = collectDescendantIds(comments, "a").sort();

		assert.deepEqual(descendants, ["b", "c"]);
	});

	it("collects nested replies transitively", () => {
		const comments = [
			createComment({ id: "a" }),
			createComment({ id: "b", parentId: "a" }),
			createComment({ id: "c", parentId: "b" }),
			createComment({ id: "d", parentId: "c" }),
		];

		const descendants = collectDescendantIds(comments, "a").sort();

		assert.deepEqual(descendants, ["b", "c", "d"]);
	});
});
