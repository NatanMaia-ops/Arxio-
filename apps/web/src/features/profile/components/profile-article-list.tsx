import {
	type Article,
	ArticleCard,
	ArticlesUnavailable,
} from "@/features/articles";
import type { ArticleEngagement } from "@/features/articles/services/article-listing";
import type { AuthorSummary } from "@/features/articles/types/article.types";
import { ProfileEmptyState } from "@/features/profile/components/profile-empty-state";

export function ProfileArticleList({
	articles,
	author,
	engagement,
}: {
	articles: Article[] | null;
	author: AuthorSummary;
	engagement: Map<string, ArticleEngagement>;
}) {
	return (
		<section aria-labelledby="profile-articles-title">
			<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-ax-line border-b pb-4">
				<h2
					id="profile-articles-title"
					className="font-home-display font-normal text-[28px] text-ax-ink leading-9 sm:text-[32px] sm:leading-10"
				>
					Artigos publicados
				</h2>

				{articles ? (
					<span className="text-ax-meta text-sm tabular-nums">
						{articles.length} {articles.length === 1 ? "artigo" : "artigos"}
					</span>
				) : null}
			</header>

			<div className="mt-5 flex flex-col gap-4">
				{articles === null ? (
					<ArticlesUnavailable
						title="Não foi possível carregar os artigos deste perfil"
						description="O perfil continua disponível, mas as publicações não puderam ser carregadas agora. Tente novamente em instantes."
					/>
				) : null}

				{articles?.length === 0 ? <ProfileEmptyState /> : null}

				{articles?.map((article) => (
					<ArticleCard
						key={article.id}
						article={article}
						author={author}
						engagement={engagement.get(article.id)}
					/>
				))}
			</div>
		</section>
	);
}
