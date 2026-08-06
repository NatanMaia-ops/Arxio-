import type { Metadata } from "next";

import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";

export const metadata: Metadata = {
	title: "Configurar perfil | Arxio",
	description: "Configure seu perfil acadêmico na Arxio.",
};

export default function OnboardingPage() {
	return <OnboardingForm />;
}
