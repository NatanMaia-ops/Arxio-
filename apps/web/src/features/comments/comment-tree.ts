import type { Comment } from "@/features/comments/types/comment.types";

export type CommentNode = Comment & { children: CommentNode[] };

function isInAncestorCycle(
	nodes: Map<string, CommentNode>,
	id: string,
): boolean {
	const visited = new Set<string>();
	let current: string | null = id;

	while (current) {
		if (visited.has(current)) return true;

		visited.add(current);
		current = nodes.get(current)?.parentId ?? null;
	}

	return false;
}

export function buildCommentTree(comments: Comment[]): CommentNode[] {
	const nodes = new Map<string, CommentNode>();

	for (const comment of comments) {
		nodes.set(comment.id, { ...comment, children: [] });
	}

	const roots: CommentNode[] = [];

	for (const comment of comments) {
		const node = nodes.get(comment.id);

		if (!node) continue;

		const parent =
			comment.parentId && comment.parentId !== comment.id
				? nodes.get(comment.parentId)
				: undefined;

		if (parent && !isInAncestorCycle(nodes, comment.id)) {
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	}

	return roots;
}

export function collectDescendantIds(
	comments: Comment[],
	id: string,
): string[] {
	const childrenByParent = new Map<string, string[]>();

	for (const comment of comments) {
		if (!comment.parentId) continue;

		const siblings = childrenByParent.get(comment.parentId) ?? [];

		siblings.push(comment.id);
		childrenByParent.set(comment.parentId, siblings);
	}

	const result: string[] = [];
	const stack = [...(childrenByParent.get(id) ?? [])];

	while (stack.length > 0) {
		const current = stack.pop();

		if (!current) continue;

		result.push(current);
		stack.push(...(childrenByParent.get(current) ?? []));
	}

	return result;
}
