"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { signInWithGoogle } from "@/features/auth/services/sign-in";

export function LoginCard() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleGoogleSignIn() {
		setIsSubmitting(true);

		try {
			await signInWithGoogle(`${window.location.origin}/artigos`);
		} catch {
			setIsSubmitting(false);
			toast.error("Não foi possível iniciar o login. Tente novamente.");
		}
	}

	return (
		<div className="w-full max-w-md rounded-2xl border border-[#e7e5e1] bg-white p-8 shadow-[0_1px_3px_rgba(28,26,23,0.04)] md:p-9">
			<div className="flex flex-col gap-2.5">
				<h2 className="font-semibold text-2xl text-[#1c1a17] tracking-tight">
					Entre ou crie sua conta
				</h2>

				<p className="text-[#57534e] text-[15px] leading-6">
					Use sua conta Google para continuar. Se for seu primeiro acesso, você
					poderá escolher seus interesses.
				</p>
			</div>

			<button
				type="button"
				onClick={handleGoogleSignIn}
				disabled={isSubmitting}
				aria-busy={isSubmitting}
				className="mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#1c1a17] font-medium text-[15px] text-white transition-colors hover:bg-[#33302b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1a17] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60"
			>
				<Image
					src="/icons/google-g-white.svg"
					alt=""
					aria-hidden="true"
					width={18}
					height={18}
					className="size-[18px]"
				/>
				{isSubmitting ? "Entrando..." : "Continuar com Google"}
			</button>

			<div className="mt-6 border-[#e7e5e1] border-t pt-5">
				<Link
					href={{ pathname: "/artigos" }}
					className="text-[#57534e] text-[15px] underline-offset-4 transition-colors hover:text-[#1c1a17] hover:underline focus-visible:text-[#1c1a17] focus-visible:underline focus-visible:outline-none"
				>
					Já tenho cadastro — ver os artigos
				</Link>
			</div>
		</div>
	);
}
