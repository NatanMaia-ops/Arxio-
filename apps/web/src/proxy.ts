import { type NextRequest, NextResponse } from "next/server";

import { profileIdSchema } from "@/features/profile/schemas/profile.schema";
import { checkPublicProfileAvailability } from "@/features/profile/services/profile-availability";

const PROFILE_PATH_PREFIX = "/perfil/";
const PROFILE_NOT_FOUND_PATH = "/perfil/nao-encontrado";
const PROFILE_EDIT_PATH = "/perfil/editar";
const AVAILABILITY_TIMEOUT_MS = 3_000;

function rewriteToProfileNotFound(request: NextRequest) {
	const destination = request.nextUrl.clone();
	destination.pathname = PROFILE_NOT_FOUND_PATH;
	destination.search = "";

	return NextResponse.rewrite(destination);
}

export async function proxy(request: NextRequest) {
	if (
		request.nextUrl.pathname === PROFILE_NOT_FOUND_PATH ||
		request.nextUrl.pathname === PROFILE_EDIT_PATH ||
		(request.method !== "GET" && request.method !== "HEAD")
	) {
		return NextResponse.next();
	}

	const id = request.nextUrl.pathname.slice(PROFILE_PATH_PREFIX.length);

	if (!profileIdSchema.safeParse(id).success) {
		return rewriteToProfileNotFound(request);
	}

	const serverUrl =
		process.env.SERVER_INTERNAL_URL || process.env.NEXT_PUBLIC_SERVER_URL;

	if (!serverUrl) return NextResponse.next();

	const availability = await checkPublicProfileAvailability(
		serverUrl,
		id,
		fetch,
		AbortSignal.timeout(AVAILABILITY_TIMEOUT_MS),
	);

	return availability === "not_found"
		? rewriteToProfileNotFound(request)
		: NextResponse.next();
}

export const config = {
	matcher: "/perfil/:id",
};
