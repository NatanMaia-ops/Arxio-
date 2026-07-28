import { NextResponse } from "next/server";

import { listArticlesWithAuthors } from "@/features/articles/services/article-listing";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const articles = await listArticlesWithAuthors();

		return NextResponse.json(
			articles.map(({ article, authorName }) => ({
				id: article.id,
				title: article.title,
				authorName,
			})),
		);
	} catch {
		return NextResponse.json(
			{ message: "Não foi possível carregar os artigos" },
			{ status: 502 },
		);
	}
}
