-- AlterTable
ALTER TABLE IF EXISTS "content_items" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "parent_student_links" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "schools" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "student_profiles" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "student_subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "teacher_subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE IF EXISTS "users" ALTER COLUMN "id" DROP DEFAULT;
