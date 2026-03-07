import { ParentRelationship, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type Body = {
  parentId?: string
  studentId?: string
  relationship?: ParentRelationship
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])

    const links = await prisma.parentStudentLink.findMany({
      where: { schoolId: sessionUser.schoolId },
      include: {
        parent: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        student: {
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
        },
      },
      orderBy: [{ parent: { fullName: "asc" } }, { student: { fullName: "asc" } }],
    })

    return NextResponse.json({
      data: links.map((link) => ({
        id: link.id,
        relationship: link.relationship,
        createdAt: link.createdAt,
        parent: link.parent,
        student: {
          id: link.student.id,
          fullName: link.student.fullName,
          email: link.student.email,
          grade: link.student.studentProfile?.grade ?? null,
          section: link.student.studentProfile?.section ?? null,
          rollNumber: link.student.studentProfile?.rollNumber ?? null,
        },
      })),
    })
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
    if (!body.parentId || !body.studentId) return apiError("parentId and studentId are required", 400)

    const [parent, student] = await Promise.all([
      prisma.user.findFirst({
        where: { id: body.parentId, schoolId: sessionUser.schoolId, role: UserRole.PARENT },
        select: { id: true },
      }),
      prisma.user.findFirst({
        where: { id: body.studentId, schoolId: sessionUser.schoolId, role: UserRole.STUDENT },
        select: { id: true },
      }),
    ])
    if (!parent) return apiError("Parent not found in your school", 404)
    if (!student) return apiError("Student not found in your school", 404)

    const link = await prisma.parentStudentLink.create({
      data: {
        schoolId: sessionUser.schoolId,
        parentId: parent.id,
        studentId: student.id,
        relationship: body.relationship ?? ParentRelationship.GUARDIAN,
      },
    })

    return NextResponse.json({ data: link }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return apiError("This parent is already linked to this student", 409)
    }
    return apiError("Internal server error", 500)
  }
}
