"use client";

import { env } from "@arxio/env/web";
import { Button } from "@arxio/ui/components/button";
import { Input } from "@arxio/ui/components/input";
import { Label } from "@arxio/ui/components/label";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import {
	fetchOnboardingState,
	OnboardingApiError,
	submitOnboarding,
} from "@/features/onboarding/services/onboarding-api";

type LoadingState = "loading" | "ready" | "error";
type Submission = "complete" | "skip" | null;

const semesters = Array.from({ length: 20 }, (_, index) => index + 1);

const fieldClassName =
	"h-12 rounded-lg border border-ax-line-3 bg-ax-surface px-4 text-[15px] text-ax-ink shadow-none placeholder:text-ax-placeholder focus-visible:border-ax-ink focus-visible:ring-1 focus-visible:ring-ax-ink/20 md:text-[15px]";
const labelClassName =
	"text-[13px] font-medium leading-[18px] text-ax-ink-soft";

function normalizeOptionalText(value: string): string | null {
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

export function OnboardingForm() {
	const router = useRouter();
	const formId = useId();
	const [loadingState, setLoadingState] = useState<LoadingState>("loading");
	const [submission, setSubmission] = useState<Submission>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [course, setCourse] = useState("");
	const [semester, setSemester] = useState("");
	const [institution, setInstitution] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);

	const loadOnboarding = useCallback(async () => {
		setLoadingState("loading");

		try {
			const state = await fetchOnboardingState(env.NEXT_PUBLIC_SERVER_URL);

			if (state.completed) {
				router.replace("/feed");
				return;
			}

			setName(state.user.name);
			setEmail(state.user.email);
			setCourse(state.studentProfile?.course ?? "");
			setSemester(state.studentProfile?.semester?.toString() ?? "");
			setInstitution(state.studentProfile?.institution ?? "");
			setLoadingState("ready");
		} catch (error) {
			if (error instanceof OnboardingApiError && error.status === 401) {
				router.replace("/login");
				return;
			}

			setLoadingState("error");
		}
	}, [router]);

	useEffect(() => {
		void loadOnboarding();
	}, [loadOnboarding]);

	function validateName(): string | null {
		const normalizedName = name.trim();

		if (normalizedName.length < 2) {
			setNameError("Informe um nome com pelo menos 2 caracteres.");
			return null;
		}

		if (normalizedName.length > 150) {
			setNameError("O nome deve ter no máximo 150 caracteres.");
			return null;
		}

		setNameError(null);
		return normalizedName;
	}

	async function completeOnboarding(skipAcademicFields: boolean) {
		const normalizedName = validateName();

		if (!normalizedName) return;

		setSubmission(skipAcademicFields ? "skip" : "complete");

		try {
			await submitOnboarding(env.NEXT_PUBLIC_SERVER_URL, {
				name: normalizedName,
				course: skipAcademicFields ? null : normalizeOptionalText(course),
				semester:
					skipAcademicFields || semester === "" ? null : Number(semester),
				institution: skipAcademicFields
					? null
					: normalizeOptionalText(institution),
			});

			router.replace("/feed");
		} catch (error) {
			if (error instanceof OnboardingApiError) {
				if (error.status === 401) {
					router.replace("/login");
					return;
				}

				if (error.status === 409) {
					router.replace("/feed");
					return;
				}
			}

			toast.error("Não foi possível concluir seu perfil. Tente novamente.");
			setSubmission(null);
		}
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void completeOnboarding(false);
	}

	if (loadingState === "loading") {
		return (
			<main
				className="flex min-h-dvh items-center justify-center bg-ax-surface px-4 py-8 text-ax-ink"
				role="status"
			>
				<p className="text-ax-ink-soft text-sm">Carregando seu perfil...</p>
			</main>
		);
	}

	if (loadingState === "error") {
		return (
			<main className="flex min-h-dvh items-center justify-center bg-ax-surface px-4 py-8 text-ax-ink">
				<section className="w-full max-w-md rounded-2xl border border-ax-line bg-ax-surface p-8 text-center">
					<h1 className="font-bold font-home-display text-3xl">
						Não foi possível carregar seu perfil
					</h1>
					<p className="mt-3 text-[15px] text-ax-ink-soft leading-6">
						Verifique sua conexão e tente novamente.
					</p>
					<Button
						type="button"
						onClick={() => void loadOnboarding()}
						className="mt-6 h-11 rounded-full bg-ax-ink px-6 text-ax-on-ink text-sm hover:bg-ax-ink-hover"
					>
						Tentar novamente
					</Button>
				</section>
			</main>
		);
	}

	const isSubmitting = submission !== null;

	return (
		<main className="flex min-h-dvh items-center justify-center bg-ax-surface px-4 py-8 text-ax-ink sm:px-6">
			<section className="w-full max-w-[820px] rounded-2xl border border-ax-line bg-ax-surface px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-11">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-3.5"
					aria-busy={isSubmitting}
				>
					<p className="font-semibold text-ax-ink-soft text-xs leading-4 tracking-[0.8px]">
						CONFIGURAÇÃO DO PERFIL
					</p>

					<h1 className="font-bold font-home-display text-[34px] leading-[1.1] sm:text-[40px] sm:leading-11">
						Vamos montar seu perfil
					</h1>

					<p className="max-w-3xl text-[15px] text-ax-ink-soft leading-6 sm:text-base">
						Confirme seus dados pessoais e, se quiser, conte um pouco sobre sua
						vida acadêmica. Essas informações serão usadas para preparar seu
						perfil inicial no Arxio.
					</p>

					<div className="mt-1 flex flex-col gap-1.5">
						<Label htmlFor={`${formId}-name`} className={labelClassName}>
							Nome completo
						</Label>
						<Input
							id={`${formId}-name`}
							name="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							onBlur={validateName}
							aria-invalid={nameError !== null}
							aria-describedby={nameError ? `${formId}-name-error` : undefined}
							disabled={isSubmitting}
							autoComplete="name"
							maxLength={150}
							className={fieldClassName}
						/>
						{nameError && (
							<p
								id={`${formId}-name-error`}
								className="text-destructive text-xs"
							>
								{nameError}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${formId}-email`} className={labelClassName}>
							E-mail
						</Label>
						<Input
							id={`${formId}-email`}
							name="email"
							value={email}
							readOnly
							aria-readonly="true"
							className={`${fieldClassName} cursor-default bg-ax-fill text-ax-ink-soft`}
						/>
					</div>

					<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`${formId}-course`} className={labelClassName}>
								Curso <span className="font-normal">(opcional)</span>
							</Label>
							<Input
								id={`${formId}-course`}
								name="course"
								value={course}
								onChange={(event) => setCourse(event.target.value)}
								disabled={isSubmitting}
								maxLength={150}
								placeholder="Ex.: Ciência da Computação"
								className={fieldClassName}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`${formId}-semester`} className={labelClassName}>
								Período atual <span className="font-normal">(opcional)</span>
							</Label>
							<select
								id={`${formId}-semester`}
								name="semester"
								value={semester}
								onChange={(event) => setSemester(event.target.value)}
								disabled={isSubmitting}
								className={`${fieldClassName} w-full appearance-auto outline-none disabled:cursor-not-allowed disabled:opacity-50`}
							>
								<option value="">Selecione um período</option>
								{semesters.map((value) => (
									<option key={value} value={value}>
										{value}º período
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${formId}-institution`} className={labelClassName}>
							Instituição / campus{" "}
							<span className="font-normal">(opcional)</span>
						</Label>
						<Input
							id={`${formId}-institution`}
							name="institution"
							value={institution}
							onChange={(event) => setInstitution(event.target.value)}
							disabled={isSubmitting}
							maxLength={150}
							placeholder="Ex.: UEPB — Campus VII"
							className={fieldClassName}
						/>
					</div>

					<p className="text-[13px] text-ax-ink-soft leading-[18px]">
						Você poderá alterar essas informações depois nas configurações do
						perfil.
					</p>

					<div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => void completeOnboarding(true)}
							disabled={isSubmitting}
							className="h-11 rounded-full border border-ax-line-3 bg-ax-surface px-6 font-medium text-[15px] text-ax-ink shadow-none hover:bg-ax-fill hover:text-ax-ink focus-visible:text-ax-ink"
						>
							{submission === "skip" ? "Pulando..." : "Pular por agora"}
						</Button>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-11 rounded-full bg-ax-ink px-7 font-medium text-[15px] text-ax-on-ink hover:bg-ax-ink-hover sm:min-w-[230px]"
						>
							{submission === "complete"
								? "Salvando..."
								: "Concluir e ir para o Feed"}
						</Button>
					</div>
				</form>
			</section>
		</main>
	);
}
