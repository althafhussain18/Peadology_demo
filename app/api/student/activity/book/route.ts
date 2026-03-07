import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { ensureContentItemForActivity } from "@/lib/student/content-item"

type BookActivityBody = {
  bookId?: string
  title?: string
  subject?: string
  minutesSpent?: number
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const body = (await request.json()) as BookActivityBody
    const bookId = typeof body.bookId === "string" ? body.bookId.trim() : ""
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const subject = typeof body.subject === "string" ? body.subject : null
    const minutesSpentRaw = Number.isFinite(body.minutesSpent) ? Number(body.minutesSpent) : 0
    const minutesSpent = Math.max(0, Math.floor(minutesSpentRaw))

    if (!bookId || !title) {
      return apiError("bookId and title are required", 400)
    }

    const contentItemId = await ensureContentItemForActivity({
      schoolId: sessionUser.schoolId,
      actorUserId: sessionUser.id,
      type: "BOOK",
      title,
      subjectName: subject,
      externalId: bookId,
    })

    await prisma.studentContentActivity.create({
      data: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        contentItemId,
        activityType: "OPEN_BOOK",
        watchMinutes: minutesSpent,
      },
    })

    return NextResponse.json({
      data: {
        ok: true,
        minutesSpent,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Forbidden", 403)
    }
    return apiError("Internal server error", 500)
  }
}
