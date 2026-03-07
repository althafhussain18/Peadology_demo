import { RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type UpdateUserBody = {
  fullName?: string
  email?: string
  status?: RecordStatus
  grade?: string
  section?: string
  rollNumber?: string
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])
    const { userId } = await context.params
    const body = (await request.json()) as UpdateUserBody

    const target = await prisma.user.findFirst({
      where: { id: userId, schoolId: sessionUser.schoolId },
      select: { id: true, role: true },
    })
    if (!target) return apiError("User not found", 404)

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.fullName ? { fullName: body.fullName.trim() } : {}),
        ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    })

    if (target.role === UserRole.STUDENT) {
      await prisma.studentProfile.upsert({
        where: { userId },
        update: {
          ...(body.grade !== undefined ? { grade: body.grade } : {}),
          ...(body.section !== undefined ? { section: body.section } : {}),
          ...(body.rollNumber !== undefined ? { rollNumber: body.rollNumber } : {}),
        },
        create: {
          schoolId: sessionUser.schoolId,
          userId,
          grade: body.grade,
          section: body.section,
          rollNumber: body.rollNumber,
        },
      })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
