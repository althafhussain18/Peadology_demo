import { FeedbackStatus, Prisma, RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { assertParentOwnsStudent } from "@/lib/dashboard/parent-scope"
import { prisma } from "@/lib/prisma"

type CreateFeedbackBody = {
  studentId?: string
  teacherId?: string | null
  subjectId?: string | null
  message?: string
}

function getRequestedStudentId(request: Request) {
  const { searchParams } = new URL(request.url)
  return searchParams.get("studentId")
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.PARENT])

    const requestedStudentId = getRequestedStudentId(request)
    if (requestedStudentId) {
      await assertParentOwnsStudent({
        schoolId: sessionUser.schoolId,
        parentId: sessionUser.id,
        studentId: requestedStudentId,
      })
    }

    const rows = await prisma.parentFeedback.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        parentId: sessionUser.id,
        ...(requestedStudentId ? { studentId: requestedStudentId } : {}),
      },
      include: {
        student: {
          select: { id: true, fullName: true },
        },
        subject: {
          select: { id: true, name: true, code: true },
        },
        teacher: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      data: rows.map((row) => ({
        id: row.id,
        studentId: row.studentId,
        teacherId: row.teacherId,
        subjectId: row.subjectId,
        message: row.message,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        student: row.student,
        subject: row.subject,
        teacher: row.teacher,
      })),
    })
  } catch (error) {
    console.error("Parent feedback list error", error)

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

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.PARENT])

    const body = (await request.json()) as CreateFeedbackBody

    const studentId = typeof body.studentId === "string" ? body.studentId.trim() : ""
    const teacherId =
      typeof body.teacherId === "string" && body.teacherId.trim().length > 0 ? body.teacherId.trim() : null
    const subjectId =
      typeof body.subjectId === "string" && body.subjectId.trim().length > 0 ? body.subjectId.trim() : null
    const message = typeof body.message === "string" ? body.message.trim() : ""

    if (!studentId) {
      return apiError("studentId is required", 400)
    }
    if (!message) {
      return apiError("message is required", 400)
    }

    await assertParentOwnsStudent({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
      studentId,
    })

    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          schoolId: sessionUser.schoolId,
          status: RecordStatus.ACTIVE,
        },
        select: { id: true },
      })
      if (!subject) {
        return apiError("Invalid subjectId", 400)
      }
    }

    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: teacherId,
          schoolId: sessionUser.schoolId,
          role: UserRole.TEACHER,
          status: RecordStatus.ACTIVE,
        },
        select: { id: true },
      })
      if (!teacher) {
        return apiError("Invalid teacherId", 400)
      }
    }

    let resolvedTeacherId = teacherId
    if (!resolvedTeacherId && subjectId) {
      const firstTeacher = await prisma.teacherSubject.findFirst({
        where: {
          schoolId: sessionUser.schoolId,
          subjectId,
        },
        select: { teacherId: true },
        orderBy: { createdAt: "asc" },
      })
      resolvedTeacherId = firstTeacher?.teacherId ?? null
    }

    if (resolvedTeacherId && subjectId) {
      const teacherSubject = await prisma.teacherSubject.findFirst({
        where: {
          schoolId: sessionUser.schoolId,
          teacherId: resolvedTeacherId,
          subjectId,
        },
        select: { id: true },
      })
      if (!teacherSubject) {
        return apiError("Selected teacher is not assigned to this subject", 400)
      }
    }

    const created = await prisma.parentFeedback.create({
      data: {
        schoolId: sessionUser.schoolId,
        parentId: sessionUser.id,
        studentId,
        teacherId: resolvedTeacherId,
        subjectId,
        message,
        status: FeedbackStatus.OPEN,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, fullName: true } },
      },
    })

    return NextResponse.json(
      {
        data: {
          id: created.id,
          studentId: created.studentId,
          teacherId: created.teacherId,
          subjectId: created.subjectId,
          message: created.message,
          status: created.status,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          student: created.student,
          subject: created.subject,
          teacher: created.teacher,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Parent feedback create error", error)

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
