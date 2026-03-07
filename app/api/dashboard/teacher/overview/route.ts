import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getTeacherScope } from "@/lib/dashboard/teacher-scope"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.TEACHER])

    const scope = await getTeacherScope({
      schoolId: sessionUser.schoolId,
      teacherId: sessionUser.id,
    })

    if (scope.subjectIds.length === 0) {
      return NextResponse.json({
        data: {
          user: {
            userId: sessionUser.id,
            fullName: sessionUser.fullName,
            role: sessionUser.role,
            schoolId: sessionUser.schoolId,
          },
          stats: {
            totalStudents: 0,
            subjectsTaught: 0,
            publishedContent: 0,
            draftContent: 0,
            recentActivities: 0,
          },
          subjects: [],
        },
      })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [publishedContent, draftContent, recentActivities] = await Promise.all([
      prisma.contentItem.count({
        where: {
          schoolId: sessionUser.schoolId,
          createdById: sessionUser.id,
          status: "PUBLISHED",
        },
      }),
      prisma.contentItem.count({
        where: {
          schoolId: sessionUser.schoolId,
          createdById: sessionUser.id,
          status: "DRAFT",
        },
      }),
      prisma.studentContentActivity.count({
        where: {
          schoolId: sessionUser.schoolId,
          studentId: { in: scope.studentIds },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ])

    return NextResponse.json({
      data: {
        user: {
          userId: sessionUser.id,
          fullName: sessionUser.fullName,
          role: sessionUser.role,
          schoolId: sessionUser.schoolId,
        },
        stats: {
          totalStudents: scope.studentIds.length,
          subjectsTaught: scope.subjects.length,
          publishedContent,
          draftContent,
          recentActivities,
        },
        subjects: scope.subjects,
      },
    })
  } catch (error) {
    console.error("Teacher dashboard overview error", error)

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
