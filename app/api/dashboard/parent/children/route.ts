import { Prisma, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"
import { getParentChildren } from "@/lib/dashboard/parent-scope"

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.PARENT])

    const children = await getParentChildren({
      schoolId: sessionUser.schoolId,
      parentId: sessionUser.id,
    })

    return NextResponse.json({
      data: children.map((item) => ({
        studentId: item.student.id,
        fullName: item.student.fullName,
        email: item.student.email,
        relationship: item.relationship,
        grade: item.student.studentProfile?.grade ?? null,
        section: item.student.studentProfile?.section ?? null,
        rollNumber: item.student.studentProfile?.rollNumber ?? null,
      })),
    })
  } catch (error) {
    console.error("Parent dashboard children error", error)

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
