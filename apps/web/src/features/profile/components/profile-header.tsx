import { CalendarDays } from "lucide-react";

import type { PublicProfile } from "@/features/profile/types/profile.types";
import { getInitials } from "@/lib/initials";

import { ProfileOwnerActions } from "./profile-owner-actions";

const joinedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
	month: "long",
	year: "numeric",
});

function getAvatarUrl(value: string | null): string | null {
	if (!value?.trim()) return null;

	try {
		const url = new URL(value);

		return url.protocol === "http:" || url.protocol === "https:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
	const avatarUrl = getAvatarUrl(profile.avatarUrl);
	const bio = profile.bio?.trim();

	return (
		<header className="flex flex-col gap-6 border-ax-line border-b pb-8 sm:flex-row sm:items-center sm:gap-8 sm:pb-10">
			<div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ax-fill-hover font-home-display font-semibold text-3xl text-ax-ink uppercase ring-1 ring-ax-line sm:size-30 sm:text-4xl">
				<span aria-hidden="true">{getInitials(profile.name)}</span>

				{avatarUrl ? (
					// biome-ignore lint/performance/noImgElement: os avatares podem vir de hosts externos dinâmicos, sem allowlist segura para next/image.
					<img
						src={avatarUrl}
						alt=""
						className="absolute inset-0 size-full object-cover"
						referrerPolicy="no-referrer"
					/>
				) : null}
			</div>

			<div className="min-w-0">
				<p className="font-medium text-ax-meta text-sm">Perfil público</p>
				<h1 className="mt-1 text-balance font-bold font-home-display text-[36px] text-ax-ink leading-10 sm:text-[46px] sm:leading-12">
					{profile.name}
				</h1>

				{bio ? (
					<p className="mt-3 max-w-2xl whitespace-pre-line text-ax-body text-base leading-6 sm:text-lg sm:leading-7">
						{bio}
					</p>
				) : null}

				<p className="mt-4 flex items-center gap-2 text-ax-meta text-sm">
					<CalendarDays className="size-4 shrink-0" aria-hidden="true" />
					Na Arxio desde {joinedAtFormatter.format(profile.createdAt)}
				</p>

				<ProfileOwnerActions profileId={profile.id} />
			</div>
		</header>
	);
}
