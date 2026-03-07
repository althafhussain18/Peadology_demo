import { RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type Body = {
  name?: string
  code?: string
  status?: RecordStatus
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])

    const school = await prisma.school.findUnique({
      where: { id: sessionUser.schoolId },
    })
    if (!school) return apiError("School not found", 404)

    return NextResponse.json({ data: school })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])
    const body = (await request.json()) as Body

    const updated = await prisma.school.update({
      where: { id: sessionUser.schoolId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.code ? { code: body.code.trim().toUpperCase() } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
