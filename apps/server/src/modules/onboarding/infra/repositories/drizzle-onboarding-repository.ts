import { db } from "@arxio/db";
import { studentProfiles } from "@arxio/db/schema/student-profile";
import { users } from "@arxio/db/schema/user";
import { eq } from "drizzle-orm";

import type { OnboardingState } from "../../entities/onboarding.entity";
import type {
	CompleteOnboardingInput,
	CompleteOnboardingResult,
	OnboardingRepository,
} from "../../repositories/onboarding-repository";

type UserRow = Pick<typeof users.$inferSelect, "id" | "name" | "email">;
type StudentProfileRow = Pick<
	typeof studentProfiles.$inferSelect,
	"course" | "semester" | "institution"
>;

function toState(
	user: UserRow,
	studentProfile: StudentProfileRow | null,
): OnboardingState {
	return {
		completed: studentProfile !== null,
		user: {
			name: user.name,
			email: user.email,
		},
		studentProfile,
	};
}

export const drizzleOnboardingRepository: OnboardingRepository = {
	async findByUserId(userId) {
		const [row] = await db
			.select({
				user: {
					id: users.id,
					name: users.name,
					email: users.email,
				},
				studentProfile: {
					id: studentProfiles.id,
					course: studentProfiles.course,
					semester: studentProfiles.semester,
					institution: studentProfiles.institution,
				},
			})
			.from(users)
			.leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
			.where(eq(users.id, userId));

		if (!row) return null;

		return toState(
			row.user,
			row.studentProfile?.id
				? {
						course: row.studentProfile.course,
						semester: row.studentProfile.semester,
						institution: row.studentProfile.institution,
					}
				: null,
		);
	},

	async complete(
		userId: string,
		input: CompleteOnboardingInput,
	): Promise<CompleteOnboardingResult> {
		return db.transaction(async (transaction) => {
			const [user] = await transaction
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
				})
				.from(users)
				.where(eq(users.id, userId))
				.for("update");

			if (!user) {
				return { status: "user-not-found" };
			}

			const [existingProfile] = await transaction
				.select({
					course: studentProfiles.course,
					semester: studentProfiles.semester,
					institution: studentProfiles.institution,
				})
				.from(studentProfiles)
				.where(eq(studentProfiles.userId, userId));

			if (existingProfile) {
				return {
					status: "already-completed",
					state: toState(user, existingProfile),
				};
			}

			const [updatedUser] = await transaction
				.update(users)
				.set({
					name: input.name,
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId))
				.returning({
					id: users.id,
					name: users.name,
					email: users.email,
				});

			if (!updatedUser) {
				return { status: "user-not-found" };
			}

			const [studentProfile] = await transaction
				.insert(studentProfiles)
				.values({
					userId,
					course: input.course,
					semester: input.semester,
					institution: input.institution,
				})
				.returning({
					course: studentProfiles.course,
					semester: studentProfiles.semester,
					institution: studentProfiles.institution,
				});

			if (!studentProfile) {
				throw new Error("Failed to create student profile");
			}

			return {
				status: "completed",
				state: toState(updatedUser, studentProfile),
			};
		});
	},
};
