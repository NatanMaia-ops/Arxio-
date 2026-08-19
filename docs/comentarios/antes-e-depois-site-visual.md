# Site — como cada comentário aparece na tela, antes e depois

## Antes

`apps/web/src/features/comments/components/comment-item.tsx`

Cada comentário sabe "em qual nível" ele está (`depth`) e calcula um espaço à esquerda proporcional a isso, com um teto de 4 níveis — depois do nível 4, o espaço para de crescer, mas o comentário continua "logicamente" numa cadeia sem fim.

```tsx
const MAX_INDENT_DEPTH = 4;

// ...

const indent = Math.min(node.depth, MAX_INDENT_DEPTH) * 24;

return (
	<div
		style={{ marginLeft: indent }}
		className={node.depth > 0 ? "border-ax-line border-l pl-4" : undefined}
	>
```

## Depois

Não existe mais "nível" — só dois formatos fixos: comentário raiz (sem recuo) e resposta (um recuo único e fixo). Quando a resposta tem um alvo diferente do autor do comentário raiz, o nome de quem ela responde aparece como prefixo do texto.

```tsx
const REPLY_INDENT = 24;

// ...

const isReply = Boolean(node.parentId);
const mention =
	node.replyToAuthorId && node.replyToAuthorId !== rootAuthorId
		? `@${authorNames.get(node.replyToAuthorId) ?? "usuário"} `
		: "";

return (
	<div
		style={isReply ? { marginLeft: REPLY_INDENT } : undefined}
		className={isReply ? "border-ax-line border-l pl-4" : undefined}
	>
		<p>{mention}{node.content}</p>
```
