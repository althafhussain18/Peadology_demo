-- Create enums
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');
CREATE TYPE "StudentActivityType" AS ENUM ('VIEW_LESSON', 'WATCH_VIDEO', 'OPEN_BOOK');

-- Create tables
CREATE TABLE "student_course_enrollments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "course_id" TEXT NOT NULL,
  "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_course_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_lesson_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "course_id" TEXT NOT NULL,
  "lesson_id" TEXT NOT NULL,
  "progress_pct" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "last_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_lesson_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_content_activities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "content_item_id" UUID NOT NULL,
  "activity_type" "StudentActivityType" NOT NULL,
  "watch_minutes" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_content_activities_pkey" PRIMARY KEY ("id")
);

-- Constraints and indexes
CREATE UNIQUE INDEX "student_course_enrollments_student_id_course_id_key" ON "student_course_enrollments"("student_id", "course_id");
CREATE INDEX "student_course_enrollments_school_id_idx" ON "student_course_enrollments"("school_id");
CREATE INDEX "student_course_enrollments_school_id_student_id_idx" ON "student_course_enrollments"("school_id", "student_id");
CREATE INDEX "student_course_enrollments_school_id_course_id_idx" ON "student_course_enrollments"("school_id", "course_id");

CREATE UNIQUE INDEX "student_lesson_progress_student_id_lesson_id_key" ON "student_lesson_progress"("student_id", "lesson_id");
CREATE INDEX "student_lesson_progress_school_id_idx" ON "student_lesson_progress"("school_id");
CREATE INDEX "student_lesson_progress_school_id_student_id_idx" ON "student_lesson_progress"("school_id", "student_id");
CREATE INDEX "student_lesson_progress_school_id_course_id_idx" ON "student_lesson_progress"("school_id", "course_id");
CREATE INDEX "student_lesson_progress_school_id_lesson_id_idx" ON "student_lesson_progress"("school_id", "lesson_id");

CREATE INDEX "student_content_activities_school_id_idx" ON "student_content_activities"("school_id");
CREATE INDEX "student_content_activities_school_id_student_id_idx" ON "student_content_activities"("school_id", "student_id");
CREATE INDEX "student_content_activities_school_id_content_item_id_idx" ON "student_content_activities"("school_id", "content_item_id");
CREATE INDEX "student_content_activities_school_id_activity_type_idx" ON "student_content_activities"("school_id", "activity_type");

-- Foreign keys
ALTER TABLE "student_course_enrollments"
  ADD CONSTRAINT "student_course_enrollments_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_course_enrollments"
  ADD CONSTRAINT "student_course_enrollments_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_lesson_progress"
  ADD CONSTRAINT "student_lesson_progress_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_lesson_progress"
  ADD CONSTRAINT "student_lesson_progress_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_content_activities"
  ADD CONSTRAINT "student_content_activities_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_content_activities"
  ADD CONSTRAINT "student_content_activities_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_content_activities"
  ADD CONSTRAINT "student_content_activities_content_item_id_fkey"
  FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
