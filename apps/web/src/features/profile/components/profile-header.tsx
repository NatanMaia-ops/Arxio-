import { CalendarDays } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import type { PublicProfile } from "@/features/profile/types/profile.types";

import { ProfileOwnerActions } from "./profile-owner-actions";

const joinedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
	month: "long",
	year: "numeric",
});

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
	const bio = profile.bio?.trim();

	return (
		<header className="flex flex-col gap-6 border-ax-line border-b pb-8 sm:flex-row sm:items-center sm:gap-8 sm:pb-10">
			<UserAvatar
				name={profile.name}
				src={profile.avatarUrl}
				className="size-24 font-home-display text-3xl sm:size-30 sm:text-4xl"
			/>

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
