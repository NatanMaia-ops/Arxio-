import type { LikesStatus } from "@/features/likes/types/like.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import * as likesApi from "./likes-api";

export function getLikesStatus(articleId: string): Promise<LikesStatus> {
	return likesApi.fetchLikesStatus(apiUrl(), articleId);
}

export function likeArticle(articleId: string): Promise<void> {
	return likesApi.likeArticle(apiUrl(), articleId);
}

export function unlikeArticle(articleId: string): Promise<void> {
	return likesApi.unlikeArticle(apiUrl(), articleId);
}
