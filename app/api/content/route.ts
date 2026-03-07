import { ContentStatus, ContentType, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError } from "@/lib/api/http"

const validTypes = new Set<ContentType>([ContentType.LESSON, ContentType.VIDEO, ContentType.BOOK])
const validStatuses = new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED])

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    const { searchParams } = new URL(request.url)

    const typeParam = searchParams.get("type")
    const subjectCodeParam = searchParams.get("subjectCode")
    const statusParam = searchParams.get("status")

    const where: {
      schoolId: string
      type?: ContentType
      status?: ContentStatus
      subjectId?: string
    } = { schoolId: sessionUser.schoolId }

    if (typeParam) {
      const parsedType = typeParam.toUpperCase() as ContentType
      if (!validTypes.has(parsedType)) {
        return apiError("Invalid content type", 400)
      }
      where.type = parsedType
    }

    if (sessionUser.role === UserRole.ADMIN) {
      if (statusParam) {
        const parsedStatus = statusParam.toUpperCase() as ContentStatus
        if (!validStatuses.has(parsedStatus)) {
          return apiError("Invalid content status", 400)
        }
        where.status = parsedStatus
      }
    } else {
      where.status = ContentStatus.PUBLISHED
    }

    if (subjectCodeParam) {
      const subject = await prisma.subject.findFirst({
        where: {
          schoolId: sessionUser.schoolId,
          code: subjectCodeParam.toUpperCase(),
        },
        select: { id: true },
      })

      if (!subject) {
        return NextResponse.json({ data: [] })
      }
      where.subjectId = subject.id
    }

    const content = await prisma.contentItem.findMany({
      where,
      include: {
        subject: { select: { id: true, code: true, name: true } },
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: content })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    return apiError("Internal server error", 500)
  }
}
