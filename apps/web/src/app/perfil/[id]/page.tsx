import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { sortByNewest } from "@/features/articles/services/article-listing";
import { getArticles } from "@/features/articles/services/articles";
import { ProfileAcademicInfo } from "@/features/profile/components/profile-academic-info";
import { ProfileArticleList } from "@/features/profile/components/profile-article-list";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { profileIdSchema } from "@/features/profile/schemas/profile.schema";
import { getPublicProfileById } from "@/features/profile/services/profiles";

export const dynamic = "force-dynamic";

type ProfilePageProps = { params: Promise<{ id: string }> };

const findPublicProfile = cache(async (id: string) => {
	try {
		const profile = await getPublicProfileById(id);

		return profile
			? { status: "found" as const, profile }
			: { status: "not_found" as const };
	} catch {
		return { status: "unavailable" as const };
	}
});

export async function generateMetadata({
	params,
}: ProfilePageProps): Promise<Metadata> {
	const { id } = await params;

	if (!profileIdSchema.safeParse(id).success) {
		return { title: "Perfil | Arxio" };
	}

	const result = await findPublicProfile(id);

	if (result.status !== "found") {
		return { title: "Perfil | Arxio" };
	}

	const bio = result.profile.bio?.trim();

	return {
		title: `${result.profile.name} | Arxio`,
		description:
			bio || `Veja os artigos publicados por ${result.profile.name} na Arxio.`,
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { id } = await params;

	if (!profileIdSchema.safeParse(id).success) notFound();

	const profileRequest = findPublicProfile(id);
	const articlesRequest = getArticles({ authorId: id })
		.then(sortByNewest)
		.catch(() => null);
	const [profileResult, articles] = await Promise.all([
		profileRequest,
		articlesRequest,
	]);

	if (profileResult.status === "not_found") notFound();

	if (profileResult.status === "unavailable") {
		return <ProfileUnavailable />;
	}

	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
				<ProfileHeader profile={profileResult.profile} />

				<div className="mt-8 flex flex-col gap-10 sm:mt-10 sm:gap-12">
					<ProfileAcademicInfo
						academicProfile={profileResult.profile.academicProfile}
					/>

					<ProfileArticleList
						articles={articles}
						authorName={profileResult.profile.name}
					/>
				</div>
			</main>
		</div>
	);
}

function ProfileUnavailable() {
	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto max-w-180 px-5 pt-20 pb-24 sm:px-6 sm:pt-30">
				<section role="status" className="flex flex-col items-start gap-4">
					<h1 className="font-bold font-home-display text-[28px] text-ax-ink leading-9 sm:text-[40px] sm:leading-11">
						Não foi possível carregar o perfil
					</h1>
					<p className="text-ax-ink-soft text-base leading-6">
						O serviço de perfis não respondeu. Tente novamente em instantes.
					</p>

					<Link
						href={{ pathname: "/feed" }}
						className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Voltar para o feed
					</Link>
				</section>
			</main>
		</div>
	);
}
