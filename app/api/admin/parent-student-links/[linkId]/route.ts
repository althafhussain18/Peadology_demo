import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ linkId: string }> },
) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])
    const { linkId } = await context.params

    const existing = await prisma.parentStudentLink.findFirst({
      where: { id: linkId, schoolId: sessionUser.schoolId },
      select: { id: true },
    })

    if (!existing) {
      return apiError("Link not found", 404)
    }

    await prisma.parentStudentLink.delete({
      where: { id: linkId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
