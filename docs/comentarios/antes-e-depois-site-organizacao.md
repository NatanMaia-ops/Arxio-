# Site — organização da lista, antes e depois

## Antes

`apps/web/src/features/comments/comment-tree.ts`

O site recebe a lista de comentários sem organização nenhuma e precisa montar a árvore sozinho: descobrir quem é filho de quem, prevenir loop (caso um dado venha corrompido) e depois desmontar essa árvore de novo numa lista simples pra exibir na tela, guardando "em qual nível cada um está".

```ts
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

export type FlatCommentNode = Comment & { depth: number };

export function flattenCommentTree(roots: CommentNode[]): FlatCommentNode[] {
	const result: FlatCommentNode[] = [];

	function visit(node: CommentNode, depth: number) {
		const { children, ...comment } = node;

		result.push({ ...comment, depth });

		for (const child of children) {
			visit(child, depth + 1);
		}
	}

	for (const root of roots) {
		visit(root, 0);
	}

	return result;
}
```

## Depois

Como uma resposta nunca pode apontar pra outra resposta (ver [antes-e-depois-servidor.md](./antes-e-depois-servidor.md)), não existe mais "árvore" pra montar — só existe "comentário raiz" e "lista de respostas dele". Isso vira uma única passada pela lista, sem recursão e sem checagem de loop.

```ts
export type CommentGroup = {
	root: Comment;
	replies: Comment[];
};

export function groupCommentsByRoot(comments: Comment[]): CommentGroup[] {
	const repliesByRoot = new Map<string, Comment[]>();

	for (const comment of comments) {
		if (!comment.parentId) continue;

		const replies = repliesByRoot.get(comment.parentId) ?? [];

		replies.push(comment);
		repliesByRoot.set(comment.parentId, replies);
	}

	return comments
		.filter((comment) => !comment.parentId)
		.map((root) => ({
			root,
			replies: repliesByRoot.get(root.id) ?? [],
		}));
}
```

O mesmo vale pra exclusão de um comentário: hoje é preciso percorrer a árvore inteira pra achar todos os descendentes de quem foi apagado. Com só 2 níveis, apagar uma raiz só precisa remover as respostas diretas dela — sem percorrer nada.
