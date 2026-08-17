"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { resolveAuthorName } from "@/features/articles/services/article-listing";
import { getSession } from "@/features/auth/services/get-session";
import {
	buildCommentTree,
	collectDescendantIds,
} from "@/features/comments/comment-tree";
import {
	editComment,
	getComments,
	postComment,
	removeComment,
} from "@/features/comments/services/comments";
import type { Comment } from "@/features/comments/types/comment.types";

import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

export function CommentsSection({ articleId }: { articleId: string }) {
	const [comments, setComments] = useState<Comment[] | null>(null);
	const [authorNames, setAuthorNames] = useState<Map<string, string>>(
		new Map(),
	);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [isSessionLoaded, setIsSessionLoaded] = useState(false);

	useEffect(() => {
		let isActive = true;

		getComments(articleId)
			.then((result) => {
				if (isActive) setComments(result);
			})
			.catch(() => {
				if (isActive) setComments([]);
			});

		getSession()
			.then((session) => {
				if (isActive) setCurrentUserId(session?.user.id ?? null);
			})
			.catch(() => {
				if (isActive) setCurrentUserId(null);
			})
			.finally(() => {
				if (isActive) setIsSessionLoaded(true);
			});

		return () => {
			isActive = false;
		};
	}, [articleId]);

	useEffect(() => {
		if (!comments || comments.length === 0) return;

		let isActive = true;
		const authorIds = [...new Set(comments.map((comment) => comment.authorId))];

		Promise.all(
			authorIds.map(
				async (authorId) =>
					[authorId, await resolveAuthorName(authorId)] as const,
			),
		).then((entries) => {
			if (isActive) setAuthorNames(new Map(entries));
		});

		return () => {
			isActive = false;
		};
	}, [comments]);

	const tree = useMemo(() => buildCommentTree(comments ?? []), [comments]);

	async function handleCreate(content: string, parentId?: string) {
		try {
			const created = await postComment(articleId, { content, parentId });

			setComments((current) => [...(current ?? []), created]);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Não foi possível publicar o comentário",
			);
			throw error;
		}
	}

	async function handleUpdate(id: string, content: string) {
		try {
			const updated = await editComment(id, content);

			setComments((current) =>
				(current ?? []).map((comment) =>
					comment.id === id ? updated : comment,
				),
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Não foi possível salvar o comentário",
			);
			throw error;
		}
	}

	async function handleDelete(id: string) {
		try {
			await removeComment(id);

			const toRemove = new Set([
				id,
				...collectDescendantIds(comments ?? [], id),
			]);

			setComments((current) =>
				(current ?? []).filter((comment) => !toRemove.has(comment.id)),
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Não foi possível excluir o comentário",
			);
			throw error;
		}
	}

	return (
		<section className="mt-12 border-ax-line border-t pt-8">
			<h2 className="font-home-display font-semibold text-[22px] text-ax-ink leading-7">
				Comentários{comments ? ` (${comments.length})` : ""}
			</h2>

			<div className="mt-6">
				{isSessionLoaded && currentUserId ? (
					<CommentForm
						submitLabel="Comentar"
						onSubmit={(content) => handleCreate(content)}
					/>
				) : null}

				{isSessionLoaded && !currentUserId ? (
					<p className="text-ax-ink-soft text-sm leading-5">
						<Link
							href={"/login" as Route}
							className="font-medium text-ax-ink hover:underline"
						>
							Entre
						</Link>{" "}
						para comentar.
					</p>
				) : null}
			</div>

			<div className="mt-2 divide-y divide-ax-line">
				{tree.map((node) => (
					<CommentItem
						key={node.id}
						node={node}
						authorNames={authorNames}
						currentUserId={currentUserId}
						onReply={(parentId, content) => handleCreate(content, parentId)}
						onUpdate={handleUpdate}
						onDelete={handleDelete}
					/>
				))}
			</div>

			{comments && comments.length === 0 ? (
				<p className="py-6 text-ax-ink-soft text-sm">
					Seja o primeiro a comentar.
				</p>
			) : null}
		</section>
	);
}
