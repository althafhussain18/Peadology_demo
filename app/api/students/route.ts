import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError } from "@/lib/api/http"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)

    let students

    if (sessionUser.role === UserRole.ADMIN) {
      students = await prisma.user.findMany({
        where: { schoolId: sessionUser.schoolId, role: UserRole.STUDENT },
        select: {
          id: true,
          fullName: true,
          email: true,
          schoolId: true,
          studentProfile: { select: { grade: true, section: true, rollNumber: true } },
        },
      })
    } else if (sessionUser.role === UserRole.TEACHER) {
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: { schoolId: sessionUser.schoolId, teacherId: sessionUser.id },
        select: { subjectId: true },
      })
      const subjectIds = teacherSubjects.map((ts) => ts.subjectId)

      if (subjectIds.length === 0) {
        return NextResponse.json({ data: [] })
      }

      students = await prisma.user.findMany({
        where: {
          schoolId: sessionUser.schoolId,
          role: UserRole.STUDENT,
          studentSubjects: {
            some: {
              schoolId: sessionUser.schoolId,
              subjectId: { in: subjectIds },
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          schoolId: true,
          studentProfile: { select: { grade: true, section: true, rollNumber: true } },
        },
      })
    } else if (sessionUser.role === UserRole.PARENT) {
      students = await prisma.user.findMany({
        where: {
          schoolId: sessionUser.schoolId,
          role: UserRole.STUDENT,
          childLinks: {
            some: {
              schoolId: sessionUser.schoolId,
              parentId: sessionUser.id,
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          schoolId: true,
          studentProfile: { select: { grade: true, section: true, rollNumber: true } },
        },
      })
    } else {
      students = await prisma.user.findMany({
        where: { id: sessionUser.id, schoolId: sessionUser.schoolId, role: UserRole.STUDENT },
        select: {
          id: true,
          fullName: true,
          email: true,
          schoolId: true,
          studentProfile: { select: { grade: true, section: true, rollNumber: true } },
        },
      })
    }

    return NextResponse.json({ data: students })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401)
    }
    return apiError("Internal server error", 500)
  }
}
