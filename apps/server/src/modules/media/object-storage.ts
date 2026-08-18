export type StoredObjectMetadata = {
	contentType: string | null;
	sizeBytes: number;
};

export type CreatePresignedUploadInput = {
	key: string;
	contentType: string;
	maxSizeBytes: number;
	expiresInSeconds: number;
};

export type PresignedUpload = {
	url: string;
	fields: Record<string, string>;
};

export type ObjectStorage = {
	createPresignedUpload(
		input: CreatePresignedUploadInput,
	): Promise<PresignedUpload>;
	getMetadata(key: string): Promise<StoredObjectMetadata | null>;
	copy(sourceKey: string, destinationKey: string): Promise<void>;
	delete(key: string): Promise<void>;
};
