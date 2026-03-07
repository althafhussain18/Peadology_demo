-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ContentType" AS ENUM ('LESSON', 'VIDEO', 'BOOK');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ParentRelationship" AS ENUM ('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER');

-- Create tables
CREATE TABLE "schools" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "grade" TEXT,
  "section" TEXT,
  "roll_number" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teacher_subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "teacher_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_student_links" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "parent_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "relationship" "ParentRelationship" NOT NULL DEFAULT 'OTHER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "parent_student_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "subject_id" UUID,
  "created_by_id" UUID NOT NULL,
  "type" "ContentType" NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- Constraints
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

CREATE UNIQUE INDEX "users_school_id_email_key" ON "users"("school_id", "email");
CREATE INDEX "users_school_id_idx" ON "users"("school_id");
CREATE INDEX "users_school_id_role_idx" ON "users"("school_id", "role");
CREATE INDEX "users_school_id_status_idx" ON "users"("school_id", "status");

CREATE UNIQUE INDEX "subjects_school_id_code_key" ON "subjects"("school_id", "code");
CREATE UNIQUE INDEX "subjects_school_id_name_key" ON "subjects"("school_id", "name");
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");

CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");
CREATE UNIQUE INDEX "student_profiles_school_id_roll_number_key" ON "student_profiles"("school_id", "roll_number");
CREATE INDEX "student_profiles_school_id_idx" ON "student_profiles"("school_id");

CREATE UNIQUE INDEX "teacher_subjects_teacher_id_subject_id_key" ON "teacher_subjects"("teacher_id", "subject_id");
CREATE INDEX "teacher_subjects_school_id_idx" ON "teacher_subjects"("school_id");
CREATE INDEX "teacher_subjects_school_id_teacher_id_idx" ON "teacher_subjects"("school_id", "teacher_id");
CREATE INDEX "teacher_subjects_school_id_subject_id_idx" ON "teacher_subjects"("school_id", "subject_id");

CREATE UNIQUE INDEX "student_subjects_student_id_subject_id_key" ON "student_subjects"("student_id", "subject_id");
CREATE INDEX "student_subjects_school_id_idx" ON "student_subjects"("school_id");
CREATE INDEX "student_subjects_school_id_student_id_idx" ON "student_subjects"("school_id", "student_id");
CREATE INDEX "student_subjects_school_id_subject_id_idx" ON "student_subjects"("school_id", "subject_id");

CREATE UNIQUE INDEX "parent_student_links_parent_id_student_id_key" ON "parent_student_links"("parent_id", "student_id");
CREATE INDEX "parent_student_links_school_id_idx" ON "parent_student_links"("school_id");
CREATE INDEX "parent_student_links_school_id_parent_id_idx" ON "parent_student_links"("school_id", "parent_id");
CREATE INDEX "parent_student_links_school_id_student_id_idx" ON "parent_student_links"("school_id", "student_id");

CREATE INDEX "content_items_school_id_idx" ON "content_items"("school_id");
CREATE INDEX "content_items_school_id_type_idx" ON "content_items"("school_id", "type");
CREATE INDEX "content_items_school_id_status_idx" ON "content_items"("school_id", "status");
CREATE INDEX "content_items_school_id_subject_id_idx" ON "content_items"("school_id", "subject_id");

-- Foreign keys
ALTER TABLE "users"
  ADD CONSTRAINT "users_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subjects"
  ADD CONSTRAINT "subjects_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_profiles"
  ADD CONSTRAINT "student_profiles_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_profiles"
  ADD CONSTRAINT "student_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_subjects"
  ADD CONSTRAINT "teacher_subjects_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_subjects"
  ADD CONSTRAINT "teacher_subjects_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_subjects"
  ADD CONSTRAINT "teacher_subjects_subject_id_fkey"
  FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_subjects"
  ADD CONSTRAINT "student_subjects_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_subjects"
  ADD CONSTRAINT "student_subjects_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_subjects"
  ADD CONSTRAINT "student_subjects_subject_id_fkey"
  FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_student_links"
  ADD CONSTRAINT "parent_student_links_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_student_links"
  ADD CONSTRAINT "parent_student_links_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_student_links"
  ADD CONSTRAINT "parent_student_links_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_items"
  ADD CONSTRAINT "content_items_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_items"
  ADD CONSTRAINT "content_items_subject_id_fkey"
  FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_items"
  ADD CONSTRAINT "content_items_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
