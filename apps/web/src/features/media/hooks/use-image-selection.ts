"use client";

import { useEffect, useState } from "react";

import { validateImageFile } from "@/features/media/services/media";

export function useImageSelection() {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	function select(nextFile: File): boolean {
		try {
			validateImageFile(nextFile);
			setFile(nextFile);
			setError(null);
			return true;
		} catch (cause) {
			setFile(null);
			setError(
				cause instanceof Error
					? cause.message
					: "A imagem selecionada é inválida",
			);
			return false;
		}
	}

	function clear() {
		setFile(null);
		setError(null);
	}

	return { file, previewUrl, error, setError, select, clear };
}
