"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { editProfileSchema } from "@/features/profile/schemas/profile.schema";
import { ProfileApiError } from "@/features/profile/services/profile-api";
import {
	getOwnAccount,
	saveOwnProfile,
} from "@/features/profile/services/profiles";
import type { OwnAccount } from "@/features/profile/types/profile.types";
import { MAX_SEMESTER } from "@/lib/academic-profile";

import { ProfileAvatarEditor } from "./profile-avatar-editor";

type FormValues = {
	name: string;
	bio: string;
	institution: string;
	course: string;
	semester: string;
};

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY_VALUES: FormValues = {
	name: "",
	bio: "",
	institution: "",
	course: "",
	semester: "",
};

const inputClassName =
	"mt-2 w-full rounded-lg border border-ax-line bg-ax-surface px-3.5 py-2.5 text-ax-ink text-sm outline-none transition-colors placeholder:text-ax-mute focus:border-ax-ink focus:ring-1 focus:ring-ax-ink disabled:cursor-not-allowed disabled:opacity-60";

export function ProfileEditForm() {
	const router = useRouter();
	const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
	const [userId, setUserId] = useState<string | null>(null);
	const [account, setAccount] = useState<OwnAccount | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [loadError, setLoadError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		let isActive = true;

		getOwnAccount()
			.then((account) => {
				if (!isActive) return;

				setUserId(account.id);
				setAccount(account);
				setValues({
					name: account.name,
					bio: account.bio ?? "",
					institution: account.academicProfile?.institution ?? "",
					course: account.academicProfile?.course ?? "",
					semester: account.academicProfile?.semester?.toString() ?? "",
				});
			})
			.catch((error: unknown) => {
				if (!isActive) return;

				if (error instanceof ProfileApiError && error.kind === "unauthorized") {
					router.replace("/login");
					return;
				}

				setLoadError("Não foi possível carregar seus dados. Tente novamente.");
			})
			.finally(() => {
				if (isActive) setIsLoading(false);
			});

		return () => {
			isActive = false;
		};
	}, [router]);

	function updateValue(field: FieldName, value: string) {
		setValues((current) => ({ ...current, [field]: value }));
		setFieldErrors((current) => ({ ...current, [field]: undefined }));
		setSubmitError(null);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		const result = editProfileSchema.safeParse(values);

		if (!result.success) {
			const errors: FieldErrors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0];
				if (
					typeof field === "string" &&
					field in values &&
					!errors[field as FieldName]
				) {
					errors[field as FieldName] = issue.message;
				}
			}
			setFieldErrors(errors);
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const account = await saveOwnProfile(result.data);
			toast.success("Perfil atualizado com sucesso.");
			router.push(`/perfil/${account.id}`);
			router.refresh();
		} catch (error) {
			if (error instanceof ProfileApiError && error.kind === "unauthorized") {
				router.replace("/login");
				return;
			}

			setSubmitError("Não foi possível salvar as alterações. Tente novamente.");
			setIsSubmitting(false);
		}
	}

	if (isLoading) return <ProfileEditLoading />;

	if (loadError) {
		return (
			<section role="alert" className="rounded-xl border border-ax-line p-5">
				<h1 className="font-bold font-home-display text-2xl text-ax-ink">
					Não foi possível editar o perfil
				</h1>
				<p className="mt-2 text-ax-body text-sm">{loadError}</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-5 rounded-full bg-ax-ink px-4 py-2 font-medium text-ax-on-ink text-sm"
				>
					Tentar novamente
				</button>
			</section>
		);
	}

	return (
		<form onSubmit={handleSubmit} noValidate>
			<div className="border-ax-line border-b pb-7">
				<p className="font-medium text-ax-meta text-sm">Seu perfil</p>
				<h1 className="mt-1 font-bold font-home-display text-3xl text-ax-ink sm:text-4xl">
					Editar perfil
				</h1>
				<p className="mt-3 max-w-2xl text-ax-body text-sm leading-6 sm:text-base">
					Atualize como você se apresenta e suas informações acadêmicas.
				</p>
			</div>

			{account ? (
				<ProfileAvatarEditor
					account={account}
					name={values.name || account.name}
					onAccountChange={setAccount}
				/>
			) : null}

			<div className="mt-8 grid gap-6">
				<Field label="Nome" name="name" error={fieldErrors.name} required>
					<input
						id="name"
						name="name"
						type="text"
						autoComplete="name"
						maxLength={150}
						disabled={isSubmitting}
						value={values.name}
						onChange={(event) => updateValue("name", event.target.value)}
						aria-invalid={Boolean(fieldErrors.name)}
						aria-describedby={fieldErrors.name ? "name-error" : undefined}
						className={inputClassName}
					/>
				</Field>

				<Field
					label="Biografia"
					name="bio"
					error={fieldErrors.bio}
					hint="Até 500 caracteres."
				>
					<textarea
						id="bio"
						name="bio"
						rows={5}
						maxLength={500}
						disabled={isSubmitting}
						value={values.bio}
						onChange={(event) => updateValue("bio", event.target.value)}
						aria-invalid={Boolean(fieldErrors.bio)}
						aria-describedby={fieldErrors.bio ? "bio-error" : "bio-hint"}
						className={`${inputClassName} min-h-32 resize-y`}
					/>
				</Field>

				<fieldset className="grid gap-5 rounded-xl border border-ax-line p-5 sm:grid-cols-2 sm:p-6">
					<legend className="px-2 font-semibold text-ax-ink text-sm">
						Informações acadêmicas (opcionais)
					</legend>

					<Field
						label="Instituição"
						name="institution"
						error={fieldErrors.institution}
					>
						<input
							id="institution"
							name="institution"
							type="text"
							maxLength={150}
							disabled={isSubmitting}
							value={values.institution}
							onChange={(event) =>
								updateValue("institution", event.target.value)
							}
							aria-invalid={Boolean(fieldErrors.institution)}
							aria-describedby={
								fieldErrors.institution ? "institution-error" : undefined
							}
							className={inputClassName}
						/>
					</Field>

					<Field label="Curso" name="course" error={fieldErrors.course}>
						<input
							id="course"
							name="course"
							type="text"
							maxLength={150}
							disabled={isSubmitting}
							value={values.course}
							onChange={(event) => updateValue("course", event.target.value)}
							aria-invalid={Boolean(fieldErrors.course)}
							aria-describedby={fieldErrors.course ? "course-error" : undefined}
							className={inputClassName}
						/>
					</Field>

					<Field label="Semestre" name="semester" error={fieldErrors.semester}>
						<input
							id="semester"
							name="semester"
							type="number"
							inputMode="numeric"
							min={1}
							max={MAX_SEMESTER}
							disabled={isSubmitting}
							value={values.semester}
							onChange={(event) => updateValue("semester", event.target.value)}
							aria-invalid={Boolean(fieldErrors.semester)}
							aria-describedby={
								fieldErrors.semester ? "semester-error" : undefined
							}
							className={inputClassName}
						/>
					</Field>
				</fieldset>
			</div>

			{submitError ? (
				<p role="alert" className="mt-6 text-destructive text-sm">
					{submitError}
				</p>
			) : null}

			<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Link
					href={userId ? `/perfil/${userId}` : "/feed"}
					aria-disabled={isSubmitting}
					className={`inline-flex items-center justify-center rounded-full border border-ax-line px-5 py-2.5 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink ${isSubmitting ? "pointer-events-none opacity-60" : ""}`}
				>
					Cancelar
				</Link>
				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex items-center justify-center gap-2 rounded-full bg-ax-ink px-5 py-2.5 font-medium text-ax-on-ink text-sm transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? (
						<LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
					) : null}
					{isSubmitting ? "Salvando..." : "Salvar alterações"}
				</button>
			</div>
		</form>
	);
}

function Field({
	label,
	name,
	error,
	hint,
	required = false,
	children,
}: {
	label: string;
	name: FieldName;
	error?: string;
	hint?: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label htmlFor={name} className="font-medium text-ax-ink text-sm">
				{label}
				{required ? <span className="text-destructive"> *</span> : null}
			</label>
			{children}
			{error ? (
				<p id={`${name}-error`} className="mt-1.5 text-destructive text-xs">
					{error}
				</p>
			) : null}
			{hint && !error ? (
				<p id={`${name}-hint`} className="mt-1.5 text-ax-meta text-xs">
					{hint}
				</p>
			) : null}
		</div>
	);
}

function ProfileEditLoading() {
	return (
		<div role="status" aria-label="Carregando dados do perfil">
			<div className="h-10 w-52 animate-pulse rounded-lg bg-ax-fill" />
			<div className="mt-8 grid gap-6">
				<div className="h-18 animate-pulse rounded-lg bg-ax-fill" />
				<div className="h-36 animate-pulse rounded-lg bg-ax-fill" />
				<div className="h-48 animate-pulse rounded-xl bg-ax-fill" />
			</div>
		</div>
	);
}
