import type { Tag } from "@/features/tags/types/tag.types";
import { apiBaseUrl as apiUrl } from "@/lib/api-base-url";

import * as tagsApi from "./tags-api";

export function getTags(): Promise<Tag[]> {
	return tagsApi.fetchTags(apiUrl());
}

export function getArticleTags(articleId: string): Promise<Tag[]> {
	return tagsApi.fetchArticleTags(apiUrl(), articleId);
}
