import { EnrollmentStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getCourseLabel, getCourseSubjectCode } from "@/lib/dashboard/course-meta"
import { prisma } from "@/lib/prisma"
import { ensureContentItemForActivity } from "@/lib/student/content-item"
import { courseLessons } from "@/lib/lessons-data"

type LessonProgressBody = {
  courseId?: string
  lessonId?: string
  lessonTitle?: string
  progressPct?: number
  completed?: boolean
  minutesSpent?: number
}

const validCourseIds = new Set(Object.keys(courseLessons))

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const body = (await request.json()) as LessonProgressBody
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : ""
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : ""
    const lessonTitle = typeof body.lessonTitle === "string" ? body.lessonTitle.trim() : lessonId
    const completed = Boolean(body.completed)
    const incomingProgress = Number.isFinite(body.progressPct) ? Number(body.progressPct) : 0
    const clampedProgress = Math.max(0, Math.min(100, Math.round(incomingProgress)))
    const minutesSpentRaw = Number.isFinite(body.minutesSpent) ? Number(body.minutesSpent) : 0
    const minutesSpent = Math.max(0, Math.floor(minutesSpentRaw))

    if (!courseId || !validCourseIds.has(courseId)) {
      return apiError("Invalid courseId", 400)
    }
    if (!lessonId) {
      return apiError("Invalid lessonId", 400)
    }

    const existing = await prisma.studentLessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: sessionUser.id,
          lessonId,
        },
      },
      select: { progressPct: true },
    })

    const nextProgress = completed ? 100 : Math.max(existing?.progressPct ?? 0, clampedProgress)

    const progress = await prisma.studentLessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: sessionUser.id,
          lessonId,
        },
      },
      create: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        courseId,
        lessonId,
        progressPct: nextProgress,
        completed: nextProgress >= 100,
      },
      update: {
        courseId,
        progressPct: nextProgress,
        completed: nextProgress >= 100,
        lastViewedAt: new Date(),
      },
      select: {
        id: true,
        courseId: true,
        lessonId: true,
        progressPct: true,
        completed: true,
        lastViewedAt: true,
      },
    })

    await prisma.studentCourseEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: sessionUser.id,
          courseId,
        },
      },
      create: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      update: {},
    })

    const subjectCode = getCourseSubjectCode(courseId)
    if (subjectCode) {
      const subject = await prisma.subject.findFirst({
        where: {
          schoolId: sessionUser.schoolId,
          code: subjectCode,
        },
        select: { id: true },
      })

      if (subject) {
        await prisma.studentSubject.upsert({
          where: {
            studentId_subjectId: {
              studentId: sessionUser.id,
              subjectId: subject.id,
            },
          },
          create: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            subjectId: subject.id,
          },
          update: {},
        })
      }
    }

    const courseLessonIds = (courseLessons[courseId] ?? []).map((lesson) => lesson.id)
    if (courseLessonIds.length > 0) {
      const completedCount = await prisma.studentLessonProgress.count({
        where: {
          schoolId: sessionUser.schoolId,
          studentId: sessionUser.id,
          courseId,
          lessonId: { in: courseLessonIds },
          completed: true,
        },
      })

      const enrollmentStatus =
        completedCount === courseLessonIds.length ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE

      await prisma.studentCourseEnrollment.update({
        where: {
          studentId_courseId: {
            studentId: sessionUser.id,
            courseId,
          },
        },
        data: { status: enrollmentStatus },
      })
    }

    if (minutesSpent > 0) {
      const contentItemId = await ensureContentItemForActivity({
        schoolId: sessionUser.schoolId,
        actorUserId: sessionUser.id,
        type: "LESSON",
        title: lessonTitle || lessonId,
        subjectName: getCourseLabel(courseId),
        externalId: lessonId,
      })

      await prisma.studentContentActivity.create({
        data: {
          schoolId: sessionUser.schoolId,
          studentId: sessionUser.id,
          contentItemId,
          activityType: "VIEW_LESSON",
          watchMinutes: minutesSpent,
        },
      })
    }

    return NextResponse.json({ data: progress })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Forbidden", 403)
    }
    return apiError("Internal server error", 500)
  }
}
