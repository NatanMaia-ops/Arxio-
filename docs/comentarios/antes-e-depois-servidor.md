# Servidor — antes e depois

## Antes

`apps/server/src/modules/comments/services/comments.service.ts`

```ts
async createComment(input: CreateCommentInput): Promise<Comment> {
	const article = await this.articles.findById(input.articleId);

	if (!article) {
		throw new NotFoundError("Artigo nao encontrado");
	}

	if (input.parentId) {
		const parent = await this.comments.findById(input.parentId);

		if (!parent || parent.articleId !== input.articleId) {
			throw new NotFoundError("Comentario pai nao encontrado");
		}
	}

	return this.comments.create(input);
}
```

Só confere se o comentário pai existe e é do mesmo artigo. Não importa se esse pai já é, ele mesmo, uma resposta — o novo comentário é salvo apontando direto pra ele, e assim a cadeia cresce sem limite.

## Depois

Antes de salvar, checa se o comentário que está sendo respondido já é uma resposta. Se for, a resposta nova é salva apontando pro comentário raiz (não pro que foi clicado), e guarda quem era o alvo original só pra exibição.

```ts
async createComment(input: CreateCommentInput): Promise<Comment> {
	const article = await this.articles.findById(input.articleId);

	if (!article) {
		throw new NotFoundError("Artigo nao encontrado");
	}

	if (!input.parentId) {
		return this.comments.create(input);
	}

	const parent = await this.comments.findById(input.parentId);

	if (!parent || parent.articleId !== input.articleId) {
		throw new NotFoundError("Comentario pai nao encontrado");
	}

	const isReplyToAReply = parent.parentId !== null;

	return this.comments.create({
		...input,
		parentId: isReplyToAReply ? parent.parentId : parent.id,
		replyToCommentId: parent.id,
		replyToAuthorId: parent.authorId,
	});
}
```

Com essa regra em vigor, uma resposta nunca pode apontar pra outra resposta — só pra um comentário raiz. Como consequência, um loop nessa cadeia deixa de ser possível de acontecer, porque um comentário raiz nunca tem pai, e uma resposta sempre aponta direto pra raiz.
