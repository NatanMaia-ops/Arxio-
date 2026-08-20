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
				className="font-home-display text-ax-ink text-display-md"
			>
				Informações acadêmicas
			</h2>

			<dl className="mt-5 grid gap-6 rounded-3xl bg-ax-surface p-6 shadow-ax-float sm:grid-cols-2 sm:gap-8 sm:p-7 lg:grid-cols-3">
				{items.map((item) => (
					<div key={item.label} className="min-w-0">
						<dt className="text-ax-meta text-label uppercase">{item.label}</dt>
						<dd className="mt-2 text-ax-ink text-body-sm">{item.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
