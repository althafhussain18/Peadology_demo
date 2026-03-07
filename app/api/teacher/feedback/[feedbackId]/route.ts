import { FeedbackStatus, Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getTeacherScope } from "@/lib/dashboard/teacher-scope"
import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{
    feedbackId: string
  }>
}

type UpdateFeedbackBody = {
  status?: string
}

const ALLOWED_STATUS = new Set<FeedbackStatus>([
  FeedbackStatus.OPEN,
  FeedbackStatus.READ,
  FeedbackStatus.RESOLVED,
])

export async function PATCH(request: Request, { params }: Params) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.TEACHER])

    const { feedbackId } = await params
    if (!feedbackId) {
      return apiError("feedbackId is required", 400)
    }

    const body = (await request.json()) as UpdateFeedbackBody
    const status = typeof body.status === "string" ? body.status.toUpperCase() : ""
    if (!ALLOWED_STATUS.has(status as FeedbackStatus)) {
      return apiError("Invalid status", 400)
    }

    const scope = await getTeacherScope({
      schoolId: sessionUser.schoolId,
      teacherId: sessionUser.id,
    })

    const feedback = await prisma.parentFeedback.findFirst({
      where: {
        id: feedbackId,
        schoolId: sessionUser.schoolId,
      },
      select: {
        id: true,
        teacherId: true,
        subjectId: true,
      },
    })

    if (!feedback) {
      return apiError("Feedback not found", 404)
    }

    const canAccessByTeacher = feedback.teacherId === sessionUser.id
    const canAccessBySubject =
      !feedback.teacherId && !!feedback.subjectId && scope.subjectIds.includes(feedback.subjectId)

    if (!canAccessByTeacher && !canAccessBySubject) {
      return apiError("Forbidden", 403)
    }

    const updated = await prisma.parentFeedback.update({
      where: { id: feedback.id },
      data: {
        status: status as FeedbackStatus,
        teacherId: feedback.teacherId ?? sessionUser.id,
      },
      include: {
        parent: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
      },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        message: updated.message,
        status: updated.status,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        parent: updated.parent,
        student: updated.student,
        subject: updated.subject,
        teacher: updated.teacher,
      },
    })
  } catch (error) {
    console.error("Teacher feedback update error", error)

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
