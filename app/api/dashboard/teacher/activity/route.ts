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

    if (scope.subjectIds.length === 0 || scope.studentIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const activities = await prisma.studentContentActivity.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        studentId: { in: scope.studentIds },
      },
      include: {
        student: {
          select: { id: true, fullName: true },
        },
        contentItem: {
          select: {
            id: true,
            title: true,
            type: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const filtered = activities.filter((activity) => {
      const subjectId = activity.contentItem.subject?.id
      if (!subjectId) {
        return true
      }
      return scope.subjectIds.includes(subjectId)
    })

    return NextResponse.json({
      data: filtered.map((activity) => ({
        id: activity.id,
        studentId: activity.student.id,
        studentName: activity.student.fullName,
        contentItemId: activity.contentItem.id,
        title: activity.contentItem.title,
        contentType: activity.contentItem.type,
        activityType: activity.activityType,
        watchMinutes: activity.watchMinutes,
        subject: activity.contentItem.subject?.name ?? null,
        at: activity.createdAt,
      })),
    })
  } catch (error) {
    console.error("Teacher dashboard activity error", error)

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
