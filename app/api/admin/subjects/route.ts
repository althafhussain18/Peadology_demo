import { RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type CreateSubjectBody = {
  name?: string
  code?: string
  status?: RecordStatus
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])

    const subjects = await prisma.subject.findMany({
      where: { schoolId: sessionUser.schoolId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: subjects })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])
    const body = (await request.json()) as CreateSubjectBody

    if (!body.name?.trim() || !body.code?.trim()) {
      return apiError("name and code are required", 400)
    }

    const subject = await prisma.subject.create({
      data: {
        schoolId: sessionUser.schoolId,
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        status: body.status ?? RecordStatus.ACTIVE,
      },
    })

    return NextResponse.json({ data: subject }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
