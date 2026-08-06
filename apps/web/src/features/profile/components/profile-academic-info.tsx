import type { AcademicProfile } from "@/features/profile/types/profile.types";

type AcademicInfoItem = {
	label: string;
	value: string;
};

function presentText(value: string | null): string | null {
	const normalized = value?.trim();

	return normalized || null;
}

export function getAcademicInfoItems(
	academicProfile: AcademicProfile | null,
): AcademicInfoItem[] {
	if (!academicProfile) return [];

	const institution = presentText(academicProfile.institution);
	const course = presentText(academicProfile.course);

	return [
		...(institution ? [{ label: "Instituição", value: institution }] : []),
		...(course ? [{ label: "Curso", value: course }] : []),
		...(academicProfile.semester !== null
			? [
					{
						label: "Período",
						value: `${academicProfile.semester}º período`,
					},
				]
			: []),
	];
}

export function ProfileAcademicInfo({
	academicProfile,
}: {
	academicProfile: AcademicProfile | null;
}) {
	const items = getAcademicInfoItems(academicProfile);

	if (items.length === 0) return null;

	return (
		<section aria-labelledby="profile-academic-title">
			<h2
				id="profile-academic-title"
				className="font-home-display font-semibold text-2xl text-ax-ink leading-8"
			>
				Informações acadêmicas
			</h2>

			<dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<div
						key={item.label}
						className="rounded-xl border border-ax-line bg-ax-surface p-4"
					>
						<dt className="font-medium text-ax-meta text-xs uppercase tracking-wide">
							{item.label}
						</dt>
						<dd className="mt-1.5 text-ax-ink text-sm leading-5">
							{item.value}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
