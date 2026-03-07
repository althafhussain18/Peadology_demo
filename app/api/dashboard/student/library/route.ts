import { ContentType, Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const activity = await prisma.studentContentActivity.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
      },
      include: {
        contentItem: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true,
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    })

    const videoMap = new Map<
      string,
      {
        contentItemId: string
        title: string
        subject: string | null
        watchedMinutes: number
        activityType: string
        at: Date
      }
    >()
    const bookMap = new Map<
      string,
      {
        contentItemId: string
        title: string
        subject: string | null
        activityType: string
        at: Date
      }
    >()

    for (const item of activity) {
      const titleKey = item.contentItem.title.trim().toLowerCase()

      if (item.contentItem.type === ContentType.VIDEO) {
        const existing = videoMap.get(titleKey)
        if (!existing) {
          videoMap.set(titleKey, {
            contentItemId: item.contentItem.id,
            title: item.contentItem.title,
            subject: item.contentItem.subject?.name ?? null,
            watchedMinutes: item.watchMinutes,
            activityType: item.activityType,
            at: item.createdAt,
          })
        } else {
          existing.watchedMinutes += item.watchMinutes
        }
      }

      if (item.contentItem.type === ContentType.BOOK) {
        const existing = bookMap.get(titleKey)
        if (!existing) {
          bookMap.set(titleKey, {
            contentItemId: item.contentItem.id,
            title: item.contentItem.title,
            subject: item.contentItem.subject?.name ?? null,
            activityType: item.activityType,
            at: item.createdAt,
          })
        }
      }
    }

    const videos = Array.from(videoMap.values())
    const books = Array.from(bookMap.values())

    return NextResponse.json({
      data: {
        videos,
        books,
      },
    })
  } catch (error) {
    console.error("Student dashboard library error", error)

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return apiError("Forbidden", 403)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return apiError("Dashboard tables are not ready. Run migrations and seed.", 500)
    }
    return apiError("Internal server error", 500)
  }
}
