import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getCourseLabel } from "@/lib/dashboard/course-meta"
import { courseLessons } from "@/lib/lessons-data"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const [enrollments, lessonProgress] = await Promise.all([
      prisma.studentCourseEnrollment.findMany({
        where: {
          schoolId: sessionUser.schoolId,
          studentId: sessionUser.id,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.studentLessonProgress.findMany({
        where: {
          schoolId: sessionUser.schoolId,
          studentId: sessionUser.id,
        },
        orderBy: { lastViewedAt: "desc" },
      }),
    ])

    const progressByCourse = new Map<
      string,
      {
        completedLessons: number
        lastLessonId: string | null
        lastViewedAt: Date | null
        progressByLessonId: Map<string, number>
      }
    >()

    for (const progress of lessonProgress) {
      const existing = progressByCourse.get(progress.courseId) ?? {
        completedLessons: 0,
        lastLessonId: null,
        lastViewedAt: null,
        progressByLessonId: new Map<string, number>(),
      }

      if (progress.completed) {
        existing.completedLessons += 1
      }
      existing.progressByLessonId.set(progress.lessonId, progress.progressPct)
      if (!existing.lastViewedAt || progress.lastViewedAt > existing.lastViewedAt) {
        existing.lastViewedAt = progress.lastViewedAt
        existing.lastLessonId = progress.lessonId
      }

      progressByCourse.set(progress.courseId, existing)
    }

    const courses = enrollments.map((enrollment) => {
      const aggregate = progressByCourse.get(enrollment.courseId)
      const knownLessons = courseLessons[enrollment.courseId] ?? []
      const totalLessons = knownLessons.length
      const completedLessons = aggregate?.completedLessons ?? 0
      const totalProgressPct =
        totalLessons > 0
          ? knownLessons.reduce((sum, lesson) => {
              return sum + (aggregate?.progressByLessonId.get(lesson.id) ?? 0)
            }, 0)
          : 0
      const completionPct = totalLessons > 0 ? Math.round(totalProgressPct / totalLessons) : 0

      return {
        courseId: enrollment.courseId,
        courseName: getCourseLabel(enrollment.courseId),
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        totalLessons,
        completedLessons,
        completionPct,
        lastLessonId: aggregate?.lastLessonId ?? null,
        lastViewedAt: aggregate?.lastViewedAt ?? null,
      }
    })

    return NextResponse.json({ data: courses })
  } catch (error) {
    console.error("Student dashboard learning error", error)

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Forbidden", 403)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return apiError("Dashboard tables are not ready. Run migrations and seed.", 500)
    }
    return apiError("Internal server error", 500)
  }
}
