-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('ON_TIME', 'LATE', 'AFTER_REOPENED');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('PDF', 'VIDEO', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AdvisoryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('TASK_ASSIGNED', 'TASK_DUE_SOON', 'TASK_GRADED', 'ADVISORY_REQUESTED', 'ADVISORY_CONFIRMED', 'ADVISORY_REMINDER', 'ANNOUNCEMENT_NEW', 'COURSE_UPDATE', 'PROGRESS_REPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."ProgressReportType" AS ENUM ('WEEKLY', 'MONTHLY', 'PARTIAL', 'FINAL');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "contactInfo" TEXT,
ADD COLUMN     "lastActivity" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."academic_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxStudents" INTEGER,
    "enrollmentDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academicPeriodId" TEXT,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grading_configs" (
    "id" TEXT NOT NULL,
    "taskWeight" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "examWeight" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "participationWeight" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "grading_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progress" SMALLINT NOT NULL DEFAULT 0,
    "currentGrade" DOUBLE PRECISION,
    "taskAverage" DOUBLE PRECISION,
    "examAverage" DOUBLE PRECISION,
    "participationGrade" DOUBLE PRECISION,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "lessonOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "allowLateSubmissions" BOOLEAN NOT NULL DEFAULT false,
    "maxFileSize" INTEGER DEFAULT 10485760,
    "allowedFileTypes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,
    "rubricId" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submissions" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "submissionStatus" "public"."SubmissionStatus" NOT NULL DEFAULT 'ON_TIME',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taskId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_attachments" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "submission_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rubrics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rubric_criteria" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxPoints" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,
    "rubricId" TEXT NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rubric_evaluations" (
    "id" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rubricId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "rubric_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rubric_criterion_evaluations" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "criterionId" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "rubric_criterion_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_grades" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "exam_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "type" "public"."ResourceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."syllabi" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "syllabi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."advisories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "duration" INTEGER,
    "status" "public"."AdvisoryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "advisories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT,
    "receiverId" TEXT NOT NULL,
    "courseId" TEXT,
    "taskId" TEXT,
    "advisoryId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."progress_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" "public"."ProgressReportType" NOT NULL,
    "content" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_periods_isActive_idx" ON "public"."academic_periods"("isActive");

-- CreateIndex
CREATE INDEX "academic_periods_startDate_endDate_idx" ON "public"."academic_periods"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "courses_joinCode_key" ON "public"."courses"("joinCode");

-- CreateIndex
CREATE INDEX "courses_teacherId_idx" ON "public"."courses"("teacherId");

-- CreateIndex
CREATE INDEX "courses_academicPeriodId_idx" ON "public"."courses"("academicPeriodId");

-- CreateIndex
CREATE INDEX "courses_enrollmentDeadline_idx" ON "public"."courses"("enrollmentDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "grading_configs_courseId_key" ON "public"."grading_configs"("courseId");

-- CreateIndex
CREATE INDEX "enrollments_studentId_idx" ON "public"."enrollments"("studentId");

-- CreateIndex
CREATE INDEX "enrollments_courseId_idx" ON "public"."enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_courseId_key" ON "public"."enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "lessons_courseId_updatedAt_idx" ON "public"."lessons"("courseId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_courseId_lessonOrder_key" ON "public"."lessons"("courseId", "lessonOrder");

-- CreateIndex
CREATE INDEX "tasks_courseId_createdAt_idx" ON "public"."tasks"("courseId", "createdAt");

-- CreateIndex
CREATE INDEX "tasks_courseId_status_dueDate_idx" ON "public"."tasks"("courseId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_courseId_idx" ON "public"."tasks"("courseId");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "public"."tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "public"."tasks"("status");

-- CreateIndex
CREATE INDEX "submissions_taskId_idx" ON "public"."submissions"("taskId");

-- CreateIndex
CREATE INDEX "submissions_studentId_idx" ON "public"."submissions"("studentId");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "public"."submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "submissions_isActive_idx" ON "public"."submissions"("isActive");

-- CreateIndex
CREATE INDEX "submission_attachments_submissionId_idx" ON "public"."submission_attachments"("submissionId");

-- CreateIndex
CREATE INDEX "rubrics_teacherId_idx" ON "public"."rubrics"("teacherId");

-- CreateIndex
CREATE INDEX "rubric_criteria_rubricId_idx" ON "public"."rubric_criteria"("rubricId");

-- CreateIndex
CREATE INDEX "rubric_criteria_order_idx" ON "public"."rubric_criteria"("order");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criteria_rubricId_order_key" ON "public"."rubric_criteria"("rubricId", "order");

-- CreateIndex
CREATE INDEX "rubric_evaluations_submissionId_idx" ON "public"."rubric_evaluations"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_evaluations_rubricId_submissionId_key" ON "public"."rubric_evaluations"("rubricId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criterion_evaluations_criterionId_evaluationId_key" ON "public"."rubric_criterion_evaluations"("criterionId", "evaluationId");

-- CreateIndex
CREATE INDEX "exams_courseId_idx" ON "public"."exams"("courseId");

-- CreateIndex
CREATE INDEX "exams_scheduledDate_idx" ON "public"."exams"("scheduledDate");

-- CreateIndex
CREATE INDEX "exam_grades_studentId_idx" ON "public"."exam_grades"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_grades_examId_studentId_key" ON "public"."exam_grades"("examId", "studentId");

-- CreateIndex
CREATE INDEX "announcements_courseId_createdAt_idx" ON "public"."announcements"("courseId", "createdAt");

-- CreateIndex
CREATE INDEX "resources_courseId_createdAt_idx" ON "public"."resources"("courseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "syllabi_courseId_key" ON "public"."syllabi"("courseId");

-- CreateIndex
CREATE INDEX "advisories_teacherId_idx" ON "public"."advisories"("teacherId");

-- CreateIndex
CREATE INDEX "advisories_studentId_idx" ON "public"."advisories"("studentId");

-- CreateIndex
CREATE INDEX "advisories_scheduledAt_idx" ON "public"."advisories"("scheduledAt");

-- CreateIndex
CREATE INDEX "advisories_status_idx" ON "public"."advisories"("status");

-- CreateIndex
CREATE INDEX "notifications_receiverId_isRead_createdAt_idx" ON "public"."notifications"("receiverId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "progress_reports_studentId_idx" ON "public"."progress_reports"("studentId");

-- CreateIndex
CREATE INDEX "progress_reports_courseId_idx" ON "public"."progress_reports"("courseId");

-- CreateIndex
CREATE INDEX "progress_reports_generatedAt_idx" ON "public"."progress_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "public"."activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "public"."activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_entity_idx" ON "public"."activity_logs"("entity");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "public"."activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "public"."users"("roleId");

-- CreateIndex
CREATE INDEX "users_lastActivity_idx" ON "public"."users"("lastActivity");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "public"."academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grading_configs" ADD CONSTRAINT "grading_configs_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "public"."rubrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_attachments" ADD CONSTRAINT "submission_attachments_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubrics" ADD CONSTRAINT "rubrics_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "public"."rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "public"."rubrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubric_criterion_evaluations" ADD CONSTRAINT "rubric_criterion_evaluations_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "public"."rubric_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rubric_criterion_evaluations" ADD CONSTRAINT "rubric_criterion_evaluations_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "public"."rubric_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_grades" ADD CONSTRAINT "exam_grades_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_grades" ADD CONSTRAINT "exam_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."syllabi" ADD CONSTRAINT "syllabi_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."advisories" ADD CONSTRAINT "advisories_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."advisories" ADD CONSTRAINT "advisories_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."advisories" ADD CONSTRAINT "advisories_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "public"."advisories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_reports" ADD CONSTRAINT "progress_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_reports" ADD CONSTRAINT "progress_reports_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================
-- Garantías de negocio extra (compatibles con PG < 16)
-- =========================

-- Extensión para índices/exclusiones
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enrollment.progress 0..100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_enroll_progress_0_100'
  ) THEN
    ALTER TABLE "public"."enrollments"
    ADD CONSTRAINT "chk_enroll_progress_0_100"
    CHECK ("progress" BETWEEN 0 AND 100);
  END IF;
END$$;

-- GradingConfig: pesos suman 100 (con redondeo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_grading_weights_100'
  ) THEN
    ALTER TABLE "public"."grading_configs"
    ADD CONSTRAINT "chk_grading_weights_100"
    CHECK (ROUND(("taskWeight" + "examWeight" + "participationWeight")::numeric, 3) = 100.000);
  END IF;
END$$;

-- AcademicPeriod: fechas válidas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_academic_period_dates'
  ) THEN
    ALTER TABLE "public"."academic_periods"
    ADD CONSTRAINT "chk_academic_period_dates"
    CHECK ("startDate" < "endDate");
  END IF;
END$$;

-- Solo un período activo a la vez (índice único parcial)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = ANY (current_schemas(true))
      AND indexname = 'ux_academic_period_active'
  ) THEN
    CREATE UNIQUE INDEX "ux_academic_period_active"
      ON "public"."academic_periods" ("isActive")
      WHERE "isActive" = true;
  END IF;
END$$;

-- Anti-solapes de asesorías (opcional)
ALTER TABLE "public"."advisories"
ADD COLUMN IF NOT EXISTS "time_range" tsrange
GENERATED ALWAYS AS (
  tsrange(
    "scheduledAt",
    COALESCE("scheduledAt" + make_interval(mins => COALESCE("duration", 0)), "scheduledAt"),
    '[)'
  )
) STORED;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'no_overlap_teacher') THEN
    ALTER TABLE "public"."advisories"
    ADD CONSTRAINT "no_overlap_teacher"
    EXCLUDE USING GIST (
      "teacherId" WITH =,
      "time_range" WITH &&
    ) WHERE ("status" IN ('PENDING','CONFIRMED'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'no_overlap_student') THEN
    ALTER TABLE "public"."advisories"
    ADD CONSTRAINT "no_overlap_student"
    EXCLUDE USING GIST (
      "studentId" WITH =,
      "time_range" WITH &&
    ) WHERE ("status" IN ('PENDING','CONFIRMED'));
  END IF;
END$$;
