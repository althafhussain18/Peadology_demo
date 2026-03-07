import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type TeacherStudentRow = {
  studentId: string
  fullName: string
  email: string
  grade: string | null
  section: string | null
  rollNumber: string | null
  subjects: Array<{ id: string; code: string; name: string }>
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.TEACHER])

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { schoolId: sessionUser.schoolId, teacherId: sessionUser.id },
      select: { subjectId: true },
    })

    const subjectIds = teacherSubjects.map((item) => item.subjectId)
    if (subjectIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const studentSubjectRows = await prisma.studentSubject.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        subjectId: { in: subjectIds },
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
    })

    const grouped = new Map<string, TeacherStudentRow>()

    for (const row of studentSubjectRows) {
      const existing = grouped.get(row.student.id)
      if (!existing) {
        grouped.set(row.student.id, {
          studentId: row.student.id,
          fullName: row.student.fullName,
          email: row.student.email,
          grade: row.student.studentProfile?.grade ?? null,
          section: row.student.studentProfile?.section ?? null,
          rollNumber: row.student.studentProfile?.rollNumber ?? null,
          subjects: [{ id: row.subject.id, code: row.subject.code, name: row.subject.name }],
        })
      } else {
        existing.subjects.push({ id: row.subject.id, code: row.subject.code, name: row.subject.name })
      }
    }

    return NextResponse.json({ data: Array.from(grouped.values()) })
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
