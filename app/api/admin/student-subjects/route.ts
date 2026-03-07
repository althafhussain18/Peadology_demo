import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type Body = {
  studentId?: string
  subjectId?: string
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])
    const body = (await request.json()) as Body
    if (!body.studentId || !body.subjectId) return apiError("studentId and subjectId are required", 400)

    const [student, subject] = await Promise.all([
      prisma.user.findFirst({
        where: { id: body.studentId, schoolId: sessionUser.schoolId, role: UserRole.STUDENT },
        select: { id: true },
      }),
      prisma.subject.findFirst({
        where: { id: body.subjectId, schoolId: sessionUser.schoolId },
        select: { id: true },
      }),
    ])
    if (!student) return apiError("Student not found in your school", 404)
    if (!subject) return apiError("Subject not found in your school", 404)

    const link = await prisma.studentSubject.create({
      data: { schoolId: sessionUser.schoolId, studentId: student.id, subjectId: subject.id },
    })

    return NextResponse.json({ data: link }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
