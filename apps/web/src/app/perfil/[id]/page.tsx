import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AppShell } from "@/components/layout/app-shell";
import {
	listEngagement,
	sortByNewest,
} from "@/features/articles/services/article-listing";
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
	const engagement = await listEngagement(
		(articles ?? []).map((article) => article.id),
	);

	if (profileResult.status === "not_found") notFound();

	if (profileResult.status === "unavailable") {
		return <ProfileUnavailable />;
	}

	return (
		<AppShell heading={<ProfileHeader profile={profileResult.profile} />}>
			<div className="flex flex-col gap-12 pt-2 sm:gap-14">
				<ProfileAcademicInfo
					academicProfile={profileResult.profile.academicProfile}
				/>

				<ProfileArticleList
					articles={articles}
					engagement={engagement}
					author={{
						id: profileResult.profile.id,
						name: profileResult.profile.name,
						avatarUrl: profileResult.profile.avatarUrl,
					}}
				/>
			</div>
		</AppShell>
	);
}

function ProfileUnavailable() {
	return (
		<AppShell>
			<div className="max-w-180">
				<section
					role="status"
					className="flex flex-col items-start gap-4 rounded-3xl bg-ax-surface p-10 shadow-ax-float"
				>
					<h1 className="font-home-display text-ax-ink text-display-lg">
						Não foi possível carregar o perfil
					</h1>
					<p className="text-ax-body text-body">
						O serviço de perfis não respondeu. Tente novamente em instantes.
					</p>

					<Link
						href={{ pathname: "/feed" }}
						className="rounded-full bg-ax-ink px-4.5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface"
					>
						Voltar para o feed
					</Link>
				</section>
			</div>
		</AppShell>
	);
}
