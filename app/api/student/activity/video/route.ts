import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"
import { ensureContentItemForActivity } from "@/lib/student/content-item"

type VideoActivityBody = {
  videoId?: string
  title?: string
  subject?: string
  watchedSecondsDelta?: number
  watchedMinutesDelta?: number
  completed?: boolean
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const body = (await request.json()) as VideoActivityBody
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : ""
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const subject = typeof body.subject === "string" ? body.subject : null
    const watchedSecondsDeltaRaw = Number.isFinite(body.watchedSecondsDelta) ? Number(body.watchedSecondsDelta) : 0
    const watchedSecondsDelta = Math.max(0, Math.floor(watchedSecondsDeltaRaw))
    const watchedMinutesDeltaRaw = Number.isFinite(body.watchedMinutesDelta) ? Number(body.watchedMinutesDelta) : 0
    const watchedMinutesDelta = Math.max(0, Math.floor(watchedMinutesDeltaRaw))
    const completed = Boolean(body.completed)

    if (!videoId || !title) {
      return apiError("videoId and title are required", 400)
    }

    const contentItemId = await ensureContentItemForActivity({
      schoolId: sessionUser.schoolId,
      actorUserId: sessionUser.id,
      type: "VIDEO",
      title,
      subjectName: subject,
      externalId: videoId,
    })

    const watchMinutes =
      watchedMinutesDelta > 0 ? watchedMinutesDelta : Math.floor(watchedSecondsDelta / 60)
    await prisma.studentContentActivity.create({
      data: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        contentItemId,
        activityType: "WATCH_VIDEO",
        watchMinutes,
      },
    })

    return NextResponse.json({
      data: {
        ok: true,
        watchMinutes,
        completed,
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
