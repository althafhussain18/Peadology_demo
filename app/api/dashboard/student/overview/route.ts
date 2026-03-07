import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { apiError, requireRole } from "@/lib/api/http"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const [enrolledCourses, completedLessons, lessonMinutesAgg, videoMinutesAgg, openedBookActivities] =
      await Promise.all([
        prisma.studentCourseEnrollment.count({
          where: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            status: { in: ["ACTIVE", "COMPLETED"] },
          },
        }),
        prisma.studentLessonProgress.count({
          where: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            completed: true,
          },
        }),
        prisma.studentContentActivity.aggregate({
          where: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            activityType: "VIEW_LESSON",
          },
          _sum: { watchMinutes: true },
        }),
        prisma.studentContentActivity.aggregate({
          where: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            activityType: "WATCH_VIDEO",
          },
          _sum: { watchMinutes: true },
        }),
        prisma.studentContentActivity.findMany({
          where: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            activityType: "OPEN_BOOK",
          },
          select: {
            contentItem: {
              select: {
                title: true,
              },
            },
          },
        }),
      ])

    const uniqueBookTitles = new Set(
      openedBookActivities
        .map((item) => item.contentItem.title.trim().toLowerCase())
        .filter((title) => Boolean(title)),
    )

    return NextResponse.json({
      data: {
        user: {
          userId: sessionUser.id,
          fullName: sessionUser.fullName,
          role: sessionUser.role,
          schoolId: sessionUser.schoolId,
        },
        stats: {
          enrolledCourses,
          completedLessons,
          lessonMinutes: lessonMinutesAgg._sum.watchMinutes ?? 0,
          videoMinutes: videoMinutesAgg._sum.watchMinutes ?? 0,
          booksOpened: uniqueBookTitles.size,
        },
      },
    })
  } catch (error) {
    console.error("Student dashboard overview error", error)

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
