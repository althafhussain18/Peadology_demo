import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getTeacherScope } from "@/lib/dashboard/teacher-scope"
import { prisma } from "@/lib/prisma"

type TeacherStudentRow = {
  studentId: string
  fullName: string
  email: string
  grade: string | null
  section: string | null
  rollNumber: string | null
  subjects: Array<{ id: string; code: string; name: string }>
  avgProgressPct: number
  lastActivityAt: Date | null
  atRisk: boolean
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.TEACHER])

    const scope = await getTeacherScope({
      schoolId: sessionUser.schoolId,
      teacherId: sessionUser.id,
    })

    if (scope.subjectIds.length === 0 || scope.studentIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [studentSubjectRows, progressByStudent, activityByStudent] = await Promise.all([
      prisma.studentSubject.findMany({
        where: {
          schoolId: sessionUser.schoolId,
          subjectId: { in: scope.subjectIds },
        },
        include: {
          subject: { select: { id: true, code: true, name: true } },
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              studentProfile: { select: { grade: true, section: true, rollNumber: true } },
            },
          },
        },
        orderBy: [{ studentId: "asc" }, { subjectId: "asc" }],
      }),
      prisma.studentLessonProgress.groupBy({
        by: ["studentId"],
        where: {
          schoolId: sessionUser.schoolId,
          studentId: { in: scope.studentIds },
        },
        _avg: { progressPct: true },
      }),
      prisma.studentContentActivity.groupBy({
        by: ["studentId"],
        where: {
          schoolId: sessionUser.schoolId,
          studentId: { in: scope.studentIds },
        },
        _max: { createdAt: true },
      }),
    ])

    const avgProgressMap = new Map<string, number>()
    for (const row of progressByStudent) {
      avgProgressMap.set(row.studentId, Math.round(row._avg.progressPct ?? 0))
    }

    const lastActivityMap = new Map<string, Date | null>()
    for (const row of activityByStudent) {
      lastActivityMap.set(row.studentId, row._max.createdAt ?? null)
    }

    const grouped = new Map<string, TeacherStudentRow>()

    for (const row of studentSubjectRows) {
      const existing = grouped.get(row.student.id)
      if (!existing) {
        const avgProgressPct = avgProgressMap.get(row.student.id) ?? 0
        const lastActivityAt = lastActivityMap.get(row.student.id) ?? null
        const noRecentActivity = !lastActivityAt || lastActivityAt < sevenDaysAgo
        const atRisk = avgProgressPct < 40 && noRecentActivity

        grouped.set(row.student.id, {
          studentId: row.student.id,
          fullName: row.student.fullName,
          email: row.student.email,
          grade: row.student.studentProfile?.grade ?? null,
          section: row.student.studentProfile?.section ?? null,
          rollNumber: row.student.studentProfile?.rollNumber ?? null,
          subjects: [{ id: row.subject.id, code: row.subject.code, name: row.subject.name }],
          avgProgressPct,
          lastActivityAt,
          atRisk,
        })
      } else {
        existing.subjects.push({ id: row.subject.id, code: row.subject.code, name: row.subject.name })
      }
    }

    return NextResponse.json({ data: Array.from(grouped.values()) })
  } catch (error) {
    console.error("Teacher dashboard students error", error)

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
