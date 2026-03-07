import { EnrollmentStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getCourseSubjectCode } from "@/lib/dashboard/course-meta"
import { prisma } from "@/lib/prisma"

const validCourseIds = new Set([
  "mathematics",
  "science",
  "english",
  "social-studies",
  "art-craft",
  "music",
])

type EnrollmentBody = {
  courseId?: string
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const enrollments = await prisma.studentCourseEnrollment.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      },
      select: { courseId: true, status: true, enrolledAt: true, updatedAt: true },
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json({ data: enrollments })
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

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.STUDENT])

    const body = (await request.json()) as EnrollmentBody
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : ""

    if (!courseId || !validCourseIds.has(courseId)) {
      return apiError("Invalid courseId", 400)
    }

    const enrollment = await prisma.studentCourseEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: sessionUser.id,
          courseId,
        },
      },
      create: {
        schoolId: sessionUser.schoolId,
        studentId: sessionUser.id,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true, courseId: true, status: true, enrolledAt: true, updatedAt: true },
    })

    const subjectCode = getCourseSubjectCode(courseId)
    if (subjectCode) {
      const subject = await prisma.subject.findFirst({
        where: {
          schoolId: sessionUser.schoolId,
          code: subjectCode,
        },
        select: { id: true },
      })

      if (subject) {
        await prisma.studentSubject.upsert({
          where: {
            studentId_subjectId: {
              studentId: sessionUser.id,
              subjectId: subject.id,
            },
          },
          create: {
            schoolId: sessionUser.schoolId,
            studentId: sessionUser.id,
            subjectId: subject.id,
          },
          update: {},
        })
      }
    }

    return NextResponse.json({ data: enrollment }, { status: 201 })
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
