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

    const feedback = await prisma.parentFeedback.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        OR: [
          { teacherId: sessionUser.id },
          {
            teacherId: null,
            subjectId: { in: scope.subjectIds.length > 0 ? scope.subjectIds : ["__no_subject__"] },
          },
        ],
      },
      include: {
        parent: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    })

    return NextResponse.json({
      data: feedback.map((item) => ({
        id: item.id,
        message: item.message,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        parent: item.parent,
        student: item.student,
        subject: item.subject,
        teacher: item.teacher,
      })),
    })
  } catch (error) {
    console.error("Teacher feedback list error", error)

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Forbidden", 403)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return apiError("Feedback tables are not ready. Run migrations and seed.", 500)
    }
    return apiError("Internal server error", 500)
  }
}
