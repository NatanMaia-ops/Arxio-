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
		<header className="flex flex-col gap-6 border-ax-line border-b pb-6 sm:flex-row sm:items-start sm:gap-8">
			<UserAvatar
				name={profile.name}
				src={profile.avatarUrl}
				className="size-24 shrink-0 font-home-display text-3xl sm:size-28 sm:text-4xl"
			/>

			<div className="min-w-0 flex-1">
				<p className="text-ax-meta text-label uppercase">Perfil público</p>

				<h1 className="mt-1.5 text-balance font-home-display text-ax-ink text-display-lg">
					{profile.name}
				</h1>

				{bio ? (
					<p className="mt-3 max-w-160 whitespace-pre-line text-ax-body text-body">
						{bio}
					</p>
				) : null}

				<p className="mt-4 flex items-center gap-2 text-ax-meta text-meta">
					<CalendarDays className="size-4 shrink-0" aria-hidden="true" />
					Na Arxio desde {joinedAtFormatter.format(profile.createdAt)}
				</p>
			</div>

			<ProfileOwnerActions profileId={profile.id} />
		</header>
	);
}
