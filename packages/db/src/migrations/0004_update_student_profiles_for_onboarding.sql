ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_enrollment_number_unique";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_verified_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "student_profiles_enrollment_number_idx";--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "institution" varchar(150);--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "enrollment_number";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "enrollment_verified_at";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "verification_method";--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN "verified_by";
