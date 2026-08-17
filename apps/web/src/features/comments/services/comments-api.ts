import {
	commentListSchema,
	commentSchema,
} from "@/features/comments/schemas/comment.schema";
import type {
	Comment,
	CommentInput,
} from "@/features/comments/types/comment.types";

export type CommentsFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function articleCommentsUrl(serverUrl: string, articleId: string): string {
	return `${serverUrl.replace(/\/$/, "")}/articles/${articleId}/comments`;
}

function commentUrl(serverUrl: string, id: string): string {
	return `${serverUrl.replace(/\/$/, "")}/comments/${id}`;
}

function parseComment(data: unknown): Comment {
	const result = commentSchema.safeParse(data);

	if (!result.success) throw new Error("Invalid comment response");

	return result.data;
}

async function readErrorMessage(
	response: Response,
	fallback: string,
): Promise<string> {
	try {
		const data: unknown = await response.json();

		if (
			typeof data === "object" &&
			data !== null &&
			"message" in data &&
			typeof data.message === "string"
		) {
			return data.message;
		}
	} catch {
		return fallback;
	}

	return fallback;
}

export async function fetchComments(
	serverUrl: string,
	articleId: string,
	fetcher: CommentsFetch = fetch,
): Promise<Comment[]> {
	const response = await fetcher(articleCommentsUrl(serverUrl, articleId), {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) throw new Error("Failed to fetch comments");

	const result = commentListSchema.safeParse(await response.json());

	if (!result.success) throw new Error("Invalid comments response");

	return result.data;
}

export async function createComment(
	serverUrl: string,
	articleId: string,
	input: CommentInput,
	fetcher: CommentsFetch = fetch,
): Promise<Comment> {
	const response = await fetcher(articleCommentsUrl(serverUrl, articleId), {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(
				response,
				"Não foi possível publicar o comentário",
			),
		);
	}

	return parseComment(await response.json());
}

export async function updateComment(
	serverUrl: string,
	id: string,
	content: string,
	fetcher: CommentsFetch = fetch,
): Promise<Comment> {
	const response = await fetcher(commentUrl(serverUrl, id), {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível salvar o comentário"),
		);
	}

	return parseComment(await response.json());
}

export async function deleteComment(
	serverUrl: string,
	id: string,
	fetcher: CommentsFetch = fetch,
): Promise<void> {
	const response = await fetcher(commentUrl(serverUrl, id), {
		method: "DELETE",
		credentials: "include",
	});

	if (response.status === 404) return;

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(response, "Não foi possível excluir o comentário"),
		);
	}
}
