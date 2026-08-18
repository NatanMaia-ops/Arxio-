"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { UserAvatar } from "@/components/user-avatar";
import {
	formatAbsoluteDate,
	formatPublishedDate,
} from "@/features/articles/article-date";
import type { AuthorSummary } from "@/features/articles/types/article.types";
import type { FlatCommentNode } from "@/features/comments/comment-tree";

import { CommentForm } from "./comment-form";
import { DeleteCommentButton } from "./delete-comment-button";

const MAX_INDENT_DEPTH = 4;

type CommentItemProps = {
	node: FlatCommentNode;
	authors: Map<string, AuthorSummary>;
	currentUserId: string | null;
	onReply: (parentId: string, content: string) => Promise<void>;
	onUpdate: (id: string, content: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
};

export function CommentItem({
	node,
	authors,
	currentUserId,
	onReply,
	onUpdate,
	onDelete,
}: CommentItemProps) {
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const author = authors.get(node.authorId) ?? {
		id: node.authorId,
		name: "Autor desconhecido",
		avatarUrl: null,
	};
	const authorName = author.name;
	const isOwner = currentUserId === node.authorId;
	const indent = Math.min(node.depth, MAX_INDENT_DEPTH) * 24;

	return (
		<div
			style={{ marginLeft: indent }}
			className={node.depth > 0 ? "border-ax-line border-l pl-4" : undefined}
		>
			<div className="flex gap-3 py-4">
				<UserAvatar
					name={authorName}
					src={author.avatarUrl}
					className="size-8 text-[11px] ring-0"
				/>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 text-[13px]">
						<Link
							href={`/perfil/${node.authorId}` as Route}
							className="font-medium text-ax-ink-soft transition-colors hover:text-ax-ink"
						>
							{authorName}
						</Link>

						<time
							dateTime={node.createdAt.toISOString()}
							title={formatAbsoluteDate(node.createdAt)}
							className="text-ax-meta"
						>
							{formatPublishedDate(node.createdAt)}
						</time>
					</div>

					{isEditing ? (
						<div className="mt-2">
							<CommentForm
								initialValue={node.content}
								submitLabel="Salvar"
								onCancel={() => setIsEditing(false)}
								onSubmit={async (content) => {
									await onUpdate(node.id, content);
									setIsEditing(false);
								}}
							/>
						</div>
					) : (
						<p className="mt-1 whitespace-pre-wrap break-words text-ax-body text-sm leading-6">
							{node.content}
						</p>
					)}

					{!isEditing ? (
						<div className="mt-2 flex items-center gap-3 text-ax-ink-soft text-xs">
							{currentUserId ? (
								<button
									type="button"
									onClick={() => setIsReplying((value) => !value)}
									className="cursor-pointer font-medium hover:text-ax-ink"
								>
									Responder
								</button>
							) : null}

							{isOwner ? (
								<>
									<button
										type="button"
										onClick={() => setIsEditing(true)}
										className="cursor-pointer font-medium hover:text-ax-ink"
									>
										Editar
									</button>

									<DeleteCommentButton onConfirm={() => onDelete(node.id)} />
								</>
							) : null}
						</div>
					) : null}

					{isReplying ? (
						<div className="mt-3">
							<CommentForm
								placeholder={`Responder a ${authorName}...`}
								submitLabel="Responder"
								onCancel={() => setIsReplying(false)}
								onSubmit={async (content) => {
									await onReply(node.id, content);
									setIsReplying(false);
								}}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
