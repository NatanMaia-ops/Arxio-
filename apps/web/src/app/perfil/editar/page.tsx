import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";

export const metadata: Metadata = {
	title: "Editar perfil | Arxio",
};

export default function EditProfilePage() {
	return (
		<AppShell
			heading={
				<header className="flex flex-col gap-3 border-ax-line border-b pb-6">
					<div>
						<p className="text-ax-meta text-label uppercase">Seu perfil</p>
						<h1 className="mt-1.5 font-home-display text-ax-ink text-display-lg">
							Editar perfil
						</h1>
					</div>

					<p className="max-w-160 text-ax-body text-body">
						Atualize como você se apresenta e suas informações acadêmicas.
					</p>
				</header>
			}
		>
			<div className="max-w-3xl pt-2">
				<ProfileEditForm />
			</div>
		</AppShell>
	);
}
