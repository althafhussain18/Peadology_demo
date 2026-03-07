import { FeedbackStatus, Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError } from "@/lib/api/http"
import { getTeacherScope } from "@/lib/dashboard/teacher-scope"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)

    if (sessionUser.role !== UserRole.TEACHER) {
      return NextResponse.json({ data: [], unreadCount: 0 })
    }

    const scope = await getTeacherScope({
      schoolId: sessionUser.schoolId,
      teacherId: sessionUser.id,
    })

    const feedback = await prisma.parentFeedback.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        status: { in: [FeedbackStatus.OPEN, FeedbackStatus.READ] },
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
        subject: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const parentIds = Array.from(new Set(feedback.map((item) => item.parentId)))
    const studentIds = Array.from(new Set(feedback.map((item) => item.studentId)))

    const parentStudentLinks =
      parentIds.length > 0 && studentIds.length > 0
        ? await prisma.parentStudentLink.findMany({
            where: {
              schoolId: sessionUser.schoolId,
              parentId: { in: parentIds },
              studentId: { in: studentIds },
            },
            select: {
              parentId: true,
              studentId: true,
              relationship: true,
            },
          })
        : []

    const relationshipMap = new Map<string, string>()
    for (const link of parentStudentLinks) {
      relationshipMap.set(`${link.parentId}:${link.studentId}`, link.relationship)
    }

    const data = feedback.map((item) => {
      const relationship = relationshipMap.get(`${item.parentId}:${item.studentId}`) ?? "GUARDIAN"
      return {
        id: item.id,
        type: "PARENT_FEEDBACK" as const,
        status: item.status,
        message: item.message,
        createdAt: item.createdAt,
        fromParent: item.parent.fullName,
        childName: item.student.fullName,
        guardianRelationship: relationship,
        subjectName: item.subject?.name ?? null,
      }
    })

    const unreadCount = data.filter((item) => item.status === FeedbackStatus.OPEN).length

    return NextResponse.json({
      data,
      unreadCount,
    })
  } catch (error) {
    console.error("Notifications error", error)

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return apiError("Notification tables are not ready. Run migrations and seed.", 500)
    }
    return apiError("Internal server error", 500)
  }
}
