import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";

export const metadata: Metadata = {
	title: "Editar perfil | Arxio",
};

export default function EditProfilePage() {
	return (
		<AppShell>
			<div className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-8 sm:pt-12 lg:px-10">
				<ProfileEditForm />
			</div>
		</AppShell>
	);
}
