import type {
	Comment,
	CommentInput,
} from "@/features/comments/types/comment.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import * as commentsApi from "./comments-api";

export function getComments(articleId: string): Promise<Comment[]> {
	return commentsApi.fetchComments(apiUrl(), articleId);
}

export function postComment(
	articleId: string,
	input: CommentInput,
): Promise<Comment> {
	return commentsApi.createComment(apiUrl(), articleId, input);
}

export function editComment(id: string, content: string): Promise<Comment> {
	return commentsApi.updateComment(apiUrl(), id, content);
}

export function removeComment(id: string): Promise<void> {
	return commentsApi.deleteComment(apiUrl(), id);
}
