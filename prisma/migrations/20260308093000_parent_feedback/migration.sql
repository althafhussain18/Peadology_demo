-- Create enum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'READ', 'RESOLVED');

-- Create table
CREATE TABLE "parent_feedback" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "school_id" UUID NOT NULL,
  "parent_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "teacher_id" UUID,
  "subject_id" UUID,
  "message" TEXT NOT NULL,
  "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "parent_feedback_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "parent_feedback_school_id_idx" ON "parent_feedback"("school_id");
CREATE INDEX "parent_feedback_school_id_parent_id_idx" ON "parent_feedback"("school_id", "parent_id");
CREATE INDEX "parent_feedback_school_id_student_id_idx" ON "parent_feedback"("school_id", "student_id");
CREATE INDEX "parent_feedback_school_id_teacher_id_idx" ON "parent_feedback"("school_id", "teacher_id");
CREATE INDEX "parent_feedback_school_id_status_idx" ON "parent_feedback"("school_id", "status");

-- Foreign keys
ALTER TABLE "parent_feedback"
  ADD CONSTRAINT "parent_feedback_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_feedback"
  ADD CONSTRAINT "parent_feedback_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_feedback"
  ADD CONSTRAINT "parent_feedback_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_feedback"
  ADD CONSTRAINT "parent_feedback_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "parent_feedback"
  ADD CONSTRAINT "parent_feedback_subject_id_fkey"
  FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
