import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";

export const metadata: Metadata = {
	title: "Editar perfil | Arxio",
};

export default function EditProfilePage() {
	return (
		<div className="min-h-dvh bg-ax-surface">
			<SiteHeader />

			<main className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
				<ProfileEditForm />
			</main>
		</div>
	);
}
