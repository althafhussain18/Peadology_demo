import { Prisma, RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { assertParentOwnsStudent, getParentChildren } from "@/lib/dashboard/parent-scope"
import { prisma } from "@/lib/prisma"

function getRequestedStudentId(request: Request) {
  const { searchParams } = new URL(request.url)
  return searchParams.get("studentId")
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.PARENT])

    const children = await getParentChildren({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
    })

    if (children.length === 0) {
      return NextResponse.json({ data: null })
    }

    const requestedStudentId = getRequestedStudentId(request)
    const studentId = requestedStudentId ?? children[0].student.id

    await assertParentOwnsStudent({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
      studentId,
    })

    const [student, enrolledCourses, completedLessons, lessonMinutesAgg, videoMinutesAgg, openedBooks, progressAgg] =
      await Promise.all([
        prisma.user.findFirst({
          where: {
            schoolId: sessionUser.schoolId,
            id: studentId,
            role: UserRole.STUDENT,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            studentProfile: {
              select: {
                grade: true,
                section: true,
                rollNumber: true,
              },
            },
          },
        }),
        prisma.studentCourseEnrollment.count({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
            status: { in: ["ACTIVE", "COMPLETED"] },
          },
        }),
        prisma.studentLessonProgress.count({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
            completed: true,
          },
        }),
        prisma.studentContentActivity.aggregate({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
            activityType: "VIEW_LESSON",
          },
          _sum: { watchMinutes: true },
        }),
        prisma.studentContentActivity.aggregate({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
            activityType: "WATCH_VIDEO",
          },
          _sum: { watchMinutes: true },
        }),
        prisma.studentContentActivity.findMany({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
            activityType: "OPEN_BOOK",
          },
          select: {
            contentItem: { select: { title: true } },
          },
        }),
        prisma.studentLessonProgress.aggregate({
          where: {
            schoolId: sessionUser.schoolId,
            studentId,
          },
          _avg: { progressPct: true },
        }),
      ])

    const subjectAssignments = await prisma.studentSubject.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        studentId,
      },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            teacherSubjects: {
              where: {
                schoolId: sessionUser.schoolId,
                teacher: {
                  status: RecordStatus.ACTIVE,
                },
              },
              include: {
                teacher: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { subject: { name: "asc" } },
    })

    if (!student) {
      return apiError("Student not found", 404)
    }

    const uniqueBookTitles = new Set(
      openedBooks
        .map((item) => item.contentItem.title.trim().toLowerCase())
        .filter((title) => Boolean(title)),
    )

    const subjectRows =
      subjectAssignments.length > 0
        ? subjectAssignments.map((assignment) => assignment.subject)
        : await prisma.subject.findMany({
            where: {
              schoolId: sessionUser.schoolId,
              status: RecordStatus.ACTIVE,
            },
            select: {
              id: true,
              code: true,
              name: true,
              teacherSubjects: {
                where: {
                  schoolId: sessionUser.schoolId,
                  teacher: {
                    status: RecordStatus.ACTIVE,
                  },
                },
                include: {
                  teacher: { select: { id: true, fullName: true } },
                },
              },
            },
            orderBy: { name: "asc" },
          })

    const subjects = subjectRows.map((subject) => {
      const dedupTeachers = new Map<string, { id: string; fullName: string }>()
      for (const teacherSubject of subject.teacherSubjects) {
        dedupTeachers.set(teacherSubject.teacher.id, teacherSubject.teacher)
      }

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        teachers: Array.from(dedupTeachers.values()),
      }
    })

    return NextResponse.json({
      data: {
        student: {
          studentId: student.id,
          fullName: student.fullName,
          email: student.email,
          grade: student.studentProfile?.grade ?? null,
          section: student.studentProfile?.section ?? null,
          rollNumber: student.studentProfile?.rollNumber ?? null,
        },
        stats: {
          enrolledCourses,
          completedLessons,
          lessonMinutes: lessonMinutesAgg._sum.watchMinutes ?? 0,
          videoMinutes: videoMinutesAgg._sum.watchMinutes ?? 0,
          booksOpened: uniqueBookTitles.size,
          avgProgressPct: Math.round(progressAgg._avg.progressPct ?? 0),
        },
        subjects,
      },
    })
  } catch (error) {
    console.error("Parent dashboard overview error", error)

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
