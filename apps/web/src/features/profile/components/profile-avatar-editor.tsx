"use client";

import { Camera, LoaderCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserAvatar } from "@/components/user-avatar";
import {
	MEDIA_ACCEPT,
	MediaUploadError,
	type MediaUploadStage,
	uploadImage,
	useImageSelection,
} from "@/features/media";
import { ProfileApiError } from "@/features/profile/services/profile-api";
import {
	deleteOwnAvatar,
	saveOwnAvatar,
} from "@/features/profile/services/profiles";
import type { OwnAccount } from "@/features/profile/types/profile.types";

const stageLabels: Record<MediaUploadStage, string> = {
	preparing: "Preparando imagem...",
	uploading: "Enviando imagem...",
	saving: "Salvando foto...",
};

export function ProfileAvatarEditor({
	account,
	name,
	onAccountChange,
}: {
	account: OwnAccount;
	name: string;
	onAccountChange: (account: OwnAccount) => void;
}) {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const selection = useImageSelection();
	const [stage, setStage] = useState<MediaUploadStage | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [isRemoveOpen, setIsRemoveOpen] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const isBusy = stage !== null || isRemoving;

	function handleSelection(event: ChangeEvent<HTMLInputElement>) {
		const selected = event.target.files?.[0];
		event.target.value = "";
		if (!selected) return;
		selection.select(selected);
		setMessage(null);
	}

	async function handleSave() {
		if (!selection.file || isBusy) return;
		setMessage(null);

		try {
			const objectKey = await uploadImage(selection.file, "avatar", setStage);
			setStage("saving");
			const nextAccount = await saveOwnAvatar(objectKey);
			onAccountChange(nextAccount);
			selection.clear();
			setMessage("Foto de perfil atualizada.");
			toast.success("Foto de perfil atualizada.");
		} catch (error) {
			if (
				(error instanceof MediaUploadError && error.kind === "unauthorized") ||
				(error instanceof ProfileApiError && error.kind === "unauthorized")
			) {
				router.replace("/login");
				return;
			}

			setMessage(
				error instanceof Error
					? error.message
					: "Não foi possível salvar a foto. Tente novamente.",
			);
		} finally {
			setStage(null);
		}
	}

	async function handleRemove() {
		if (isRemoving) return;
		setIsRemoving(true);
		setMessage(null);

		try {
			const nextAccount = await deleteOwnAvatar();
			onAccountChange(nextAccount);
			selection.clear();
			setIsRemoveOpen(false);
			setMessage("Foto personalizada removida.");
			toast.success("Foto personalizada removida.");
		} catch (error) {
			if (error instanceof ProfileApiError && error.kind === "unauthorized") {
				router.replace("/login");
				return;
			}
			setMessage(
				error instanceof Error
					? error.message
					: "Não foi possível remover a foto. Tente novamente.",
			);
		} finally {
			setIsRemoving(false);
		}
	}

	const displayedUrl = selection.previewUrl ?? account.avatarUrl;
	const error =
		selection.error ?? (message?.startsWith("Foto") ? null : message);

	return (
		<section
			className="mt-8 border-ax-line border-b pb-8"
			aria-labelledby="avatar-title"
		>
			<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
				<UserAvatar
					name={name}
					src={displayedUrl}
					className="size-24 font-home-display text-2xl"
				/>
				<div className="min-w-0 flex-1">
					<h2 id="avatar-title" className="font-medium text-ax-ink text-body">
						Foto de perfil
					</h2>
					<p id="avatar-help" className="mt-1 text-ax-meta text-sm">
						JPEG, PNG ou WebP. Tamanho máximo de 5 MB.
					</p>
					<input
						ref={inputRef}
						id="avatar-file"
						type="file"
						accept={MEDIA_ACCEPT}
						className="sr-only"
						aria-describedby={`avatar-help${error ? " avatar-error" : ""}`}
						onChange={handleSelection}
						disabled={isBusy}
					/>
					<div className="mt-4 flex flex-wrap gap-2">
						<label
							htmlFor="avatar-file"
							className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-ax-line px-4 font-medium text-ax-ink text-sm transition-colors hover:border-ax-ink ${isBusy ? "pointer-events-none opacity-50" : ""}`}
						>
							<Camera className="size-4" aria-hidden="true" />
							{selection.file ? "Trocar foto" : "Escolher foto"}
						</label>
						{selection.file ? (
							<>
								<button
									type="button"
									onClick={handleSave}
									disabled={isBusy}
									className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ax-ink px-4 font-medium text-ax-on-ink text-sm disabled:opacity-50"
								>
									{stage ? (
										<LoaderCircle
											className="size-4 animate-spin"
											aria-hidden="true"
										/>
									) : null}
									Salvar foto
								</button>
								<button
									type="button"
									onClick={() => {
										selection.clear();
										setMessage(null);
										inputRef.current?.focus();
									}}
									disabled={isBusy}
									className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 font-medium text-ax-ink-soft text-sm hover:text-ax-ink disabled:opacity-50"
								>
									<X className="size-4" aria-hidden="true" /> Cancelar
								</button>
							</>
						) : null}
						{account.hasCustomAvatar && !selection.file ? (
							<button
								type="button"
								onClick={() => setIsRemoveOpen(true)}
								disabled={isBusy}
								className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 font-medium text-ax-meta text-sm hover:text-destructive disabled:opacity-50"
							>
								<Trash2 className="size-4" aria-hidden="true" /> Remover foto
							</button>
						) : null}
					</div>
					<div aria-live="polite" className="mt-3 min-h-5 text-sm">
						{stage ? (
							<p className="text-ax-meta">{stageLabels[stage]}</p>
						) : null}
						{error ? (
							<p id="avatar-error" role="alert" className="text-destructive">
								{error}
							</p>
						) : null}
						{message && !error ? (
							<p className="text-ax-meta">{message}</p>
						) : null}
					</div>
				</div>
			</div>

			<ConfirmDialog
				open={isRemoveOpen}
				onOpenChange={setIsRemoveOpen}
				title="Remover foto de perfil?"
				description="A foto personalizada será removida. Se sua conta tiver uma imagem externa, ela voltará a ser exibida."
				confirmLabel="Remover foto"
				isConfirming={isRemoving}
				onConfirm={handleRemove}
			/>
		</section>
	);
}
