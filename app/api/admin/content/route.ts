import { ContentStatus, ContentType, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type Body = {
  type?: ContentType
  subjectId?: string | null
  title?: string
  description?: string
  metadata?: unknown
  status?: ContentStatus
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])

    const items = await prisma.contentItem.findMany({
      where: { schoolId: sessionUser.schoolId },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: items })
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
    const body = (await request.json()) as Body
    if (!body.type || !body.title?.trim()) return apiError("type and title are required", 400)

    if (body.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: body.subjectId, schoolId: sessionUser.schoolId },
        select: { id: true },
      })
      if (!subject) return apiError("Subject not found in your school", 404)
    }

    const item = await prisma.contentItem.create({
      data: {
        schoolId: sessionUser.schoolId,
        subjectId: body.subjectId ?? null,
        createdById: sessionUser.id,
        type: body.type,
        title: body.title.trim(),
        description: body.description?.trim(),
        metadata: (body.metadata ?? undefined) as object | undefined,
        status: body.status ?? ContentStatus.PUBLISHED,
      },
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    return apiError("Internal server error", 500)
  }
}
