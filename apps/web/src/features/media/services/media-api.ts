import { mediaUploadTicketSchema } from "@/features/media/schemas/media.schema";
import type {
	MediaPurpose,
	MediaUploadTicket,
	SupportedImageType,
} from "@/features/media/types/media.types";

export type MediaFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export type MediaUploadErrorKind =
	| "unauthorized"
	| "ticket_failed"
	| "invalid_response"
	| "storage_failed";

export class MediaUploadError extends Error {
	constructor(
		public readonly kind: MediaUploadErrorKind,
		message: string,
		public readonly status?: number,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "MediaUploadError";
	}
}

async function readErrorMessage(
	response: Response,
	fallback: string,
): Promise<string> {
	try {
		const data: unknown = await response.json();
		if (
			typeof data === "object" &&
			data !== null &&
			"message" in data &&
			typeof data.message === "string"
		) {
			return data.message;
		}
	} catch {
		return fallback;
	}

	return fallback;
}

export async function requestMediaUpload(
	serverUrl: string,
	input: {
		purpose: MediaPurpose;
		contentType: SupportedImageType;
		sizeBytes: number;
	},
	fetcher: MediaFetch = fetch,
): Promise<MediaUploadTicket> {
	let response: Response;

	try {
		response = await fetcher(`${serverUrl.replace(/\/$/, "")}/media/uploads`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});
	} catch (cause) {
		throw new MediaUploadError(
			"ticket_failed",
			"Não foi possível preparar o envio da imagem",
			undefined,
			{ cause },
		);
	}

	if (!response.ok) {
		const kind = response.status === 401 ? "unauthorized" : "ticket_failed";
		throw new MediaUploadError(
			kind,
			await readErrorMessage(
				response,
				"Não foi possível preparar o envio da imagem",
			),
			response.status,
		);
	}

	let data: unknown;
	try {
		data = await response.json();
	} catch (cause) {
		throw new MediaUploadError(
			"invalid_response",
			"O serviço de imagens retornou uma resposta inválida",
			response.status,
			{ cause },
		);
	}

	const result = mediaUploadTicketSchema.safeParse(data);
	if (!result.success) {
		throw new MediaUploadError(
			"invalid_response",
			"O serviço de imagens retornou uma resposta inválida",
			response.status,
			{ cause: result.error },
		);
	}

	return result.data;
}

export async function sendFileToStorage(
	ticket: MediaUploadTicket,
	file: File,
	fetcher: MediaFetch = fetch,
): Promise<void> {
	const body = new FormData();
	for (const [name, value] of Object.entries(ticket.fields)) {
		body.append(name, value);
	}
	body.append("file", file);

	let response: Response;
	try {
		response = await fetcher(ticket.uploadUrl, {
			method: "POST",
			credentials: "omit",
			body,
		});
	} catch (cause) {
		throw new MediaUploadError(
			"storage_failed",
			"Não foi possível enviar a imagem ao armazenamento. Verifique a conexão e a configuração de CORS.",
			undefined,
			{ cause },
		);
	}

	if (!response.ok) {
		throw new MediaUploadError(
			"storage_failed",
			"O armazenamento recusou o envio da imagem",
			response.status,
		);
	}
}
