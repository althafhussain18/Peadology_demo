-- AlterTable
ALTER TABLE "content_items" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parent_feedback" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "parent_student_links" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_content_activities" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_course_enrollments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_lesson_progress" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_profiles" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "teacher_subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
