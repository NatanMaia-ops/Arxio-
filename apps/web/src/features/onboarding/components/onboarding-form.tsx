"use client";

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
import {
	COURSE_MAX_LENGTH,
	INSTITUTION_MAX_LENGTH,
	SEMESTERS,
} from "@/lib/academic-profile";
import { apiBaseUrl } from "@/lib/api-base-url";
import { USER_NAME_MAX_LENGTH } from "@/lib/user-profile";

import {
	type AcademicFieldErrors,
	validateAcademicFields,
	validateUserName,
} from "./onboarding-form.validation";

type LoadingState = "loading" | "ready" | "error";
type Submission = "complete" | "skip" | null;

const fieldClassName =
	"h-12 rounded-lg border border-ax-line-3 bg-ax-surface px-4 text-[15px] text-ax-ink shadow-none placeholder:text-ax-placeholder focus-visible:border-ax-ink focus-visible:ring-1 focus-visible:ring-ax-ink/20 md:text-[15px]";
const labelClassName =
	"text-[13px] font-medium leading-[18px] text-ax-ink-soft";

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
	const [academicErrors, setAcademicErrors] = useState<AcademicFieldErrors>({});

	const loadOnboarding = useCallback(async () => {
		setLoadingState("loading");

		try {
			const state = await fetchOnboardingState(apiBaseUrl());

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
		const result = validateUserName(name);
		setNameError(result.error);
		return result.name;
	}

	function refreshAcademicErrors(nextValues: {
		course: string;
		semester: string;
		institution: string;
	}) {
		if (Object.keys(academicErrors).length > 0) {
			setAcademicErrors(validateAcademicFields(nextValues).errors);
		}
	}

	async function completeOnboarding(skipAcademicFields: boolean) {
		const normalizedName = validateName();

		if (!normalizedName) return;

		const academicValidation = validateAcademicFields({
			course,
			semester,
			institution,
		});

		if (
			!skipAcademicFields &&
			Object.keys(academicValidation.errors).length > 0
		) {
			setAcademicErrors(academicValidation.errors);
			return;
		}

		if (skipAcademicFields) {
			setAcademicErrors({});
		}

		setSubmission(skipAcademicFields ? "skip" : "complete");

		try {
			await submitOnboarding(apiBaseUrl(), {
				name: normalizedName,
				...(skipAcademicFields
					? { course: null, semester: null, institution: null }
					: academicValidation.input),
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
					<h1 className="font-home-display text-display-lg">
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
	const hasAcademicErrors = Object.keys(academicErrors).length > 0;

	return (
		<main className="flex min-h-dvh items-center justify-center bg-ax-surface px-4 py-8 text-ax-ink sm:px-6">
			<section className="w-full max-w-[820px] rounded-2xl border border-ax-line bg-ax-surface px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-11">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-3.5"
					aria-busy={isSubmitting}
				>
					<p className="font-medium text-ax-ink-soft text-xs leading-4 tracking-[0.8px]">
						CONFIGURAÇÃO DO PERFIL
					</p>

					<h1 className="font-home-display text-display-lg">
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
							maxLength={USER_NAME_MAX_LENGTH}
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

					<fieldset className="mt-1 flex flex-col gap-3.5 border-0 p-0">
						<legend className={labelClassName}>
							Dados acadêmicos
							<span className="font-normal"> (opcional)</span>
						</legend>
						<p className="mt-1 text-[13px] text-ax-ink-soft leading-[18px]">
							Ao preencher um dado acadêmico, complete também os outros dois.
						</p>

						{hasAcademicErrors && (
							<p className="-mt-2 text-destructive text-xs" role="alert">
								Preencha todos os dados acadêmicos ou deixe os três em branco.
							</p>
						)}

						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor={`${formId}-course`} className={labelClassName}>
									Curso
								</Label>
								<Input
									id={`${formId}-course`}
									name="course"
									value={course}
									onChange={(event) => {
										const nextCourse = event.target.value;
										setCourse(nextCourse);
										refreshAcademicErrors({
											course: nextCourse,
											semester,
											institution,
										});
									}}
									aria-invalid={Boolean(academicErrors.course)}
									aria-describedby={
										academicErrors.course ? `${formId}-course-error` : undefined
									}
									disabled={isSubmitting}
									maxLength={COURSE_MAX_LENGTH}
									placeholder="Ex.: Ciência da Computação"
									className={fieldClassName}
								/>
								{academicErrors.course && (
									<p
										id={`${formId}-course-error`}
										className="text-destructive text-xs"
									>
										{academicErrors.course}
									</p>
								)}
							</div>

							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor={`${formId}-semester`}
									className={labelClassName}
								>
									Período atual
								</Label>
								<select
									id={`${formId}-semester`}
									name="semester"
									value={semester}
									onChange={(event) => {
										const nextSemester = event.target.value;
										setSemester(nextSemester);
										refreshAcademicErrors({
											course,
											semester: nextSemester,
											institution,
										});
									}}
									aria-invalid={Boolean(academicErrors.semester)}
									aria-describedby={
										academicErrors.semester
											? `${formId}-semester-error`
											: undefined
									}
									disabled={isSubmitting}
									className={`${fieldClassName} w-full appearance-auto outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20`}
								>
									<option value="">Selecione um período</option>
									{SEMESTERS.map((value) => (
										<option key={value} value={value}>
											{value}º período
										</option>
									))}
								</select>
								{academicErrors.semester && (
									<p
										id={`${formId}-semester-error`}
										className="text-destructive text-xs"
									>
										{academicErrors.semester}
									</p>
								)}
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label
								htmlFor={`${formId}-institution`}
								className={labelClassName}
							>
								Instituição / campus
							</Label>
							<Input
								id={`${formId}-institution`}
								name="institution"
								value={institution}
								onChange={(event) => {
									const nextInstitution = event.target.value;
									setInstitution(nextInstitution);
									refreshAcademicErrors({
										course,
										semester,
										institution: nextInstitution,
									});
								}}
								aria-invalid={Boolean(academicErrors.institution)}
								aria-describedby={
									academicErrors.institution
										? `${formId}-institution-error`
										: undefined
								}
								disabled={isSubmitting}
								maxLength={INSTITUTION_MAX_LENGTH}
								placeholder="Ex.: UEPB — Campus VII"
								className={fieldClassName}
							/>
							{academicErrors.institution && (
								<p
									id={`${formId}-institution-error`}
									className="text-destructive text-xs"
								>
									{academicErrors.institution}
								</p>
							)}
						</div>
					</fieldset>

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
