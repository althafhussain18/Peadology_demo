import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { assertParentOwnsStudent, getParentChildren } from "@/lib/dashboard/parent-scope"
import { prisma } from "@/lib/prisma"

function getRequestedStudentId(request: Request) {
  const { searchParams } = new URL(request.url)
  return searchParams.get("studentId")
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.PARENT])

    const children = await getParentChildren({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
    })

    if (children.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const requestedStudentId = getRequestedStudentId(request)
    const studentId = requestedStudentId ?? children[0].student.id

    await assertParentOwnsStudent({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
      studentId,
    })

    const activity = await prisma.studentContentActivity.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        studentId,
      },
      include: {
        contentItem: {
          select: {
            id: true,
            title: true,
            type: true,
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      data: activity.map((item) => ({
        id: item.id,
        contentItemId: item.contentItem.id,
        title: item.contentItem.title,
        type: item.contentItem.type,
        activityType: item.activityType,
        watchMinutes: item.watchMinutes,
        subject: item.contentItem.subject?.name ?? null,
        at: item.createdAt,
      })),
    })
  } catch (error) {
    console.error("Parent dashboard activity error", error)

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
