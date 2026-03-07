import { RecordStatus, UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth/session"
import { apiError, requireRole } from "@/lib/api/http"

type CreateUserBody = {
  fullName?: string
  email?: string
  password?: string
  role?: UserRole
  status?: RecordStatus
  grade?: string
  section?: string
  rollNumber?: string
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request)
    requireRole(sessionUser, [UserRole.ADMIN])

    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get("role")
    const role = roleParam ? (roleParam.toUpperCase() as UserRole) : undefined

    const users = await prisma.user.findMany({
      where: {
        schoolId: sessionUser.schoolId,
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        schoolId: true,
        createdAt: true,
        studentProfile: {
          select: { grade: true, section: true, rollNumber: true },
        },
      },
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
    })

    return NextResponse.json({ data: users })
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

    const body = (await request.json()) as CreateUserBody
    const fullName = body.fullName?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password?.trim()
    const role = body.role
    const status = body.status ?? RecordStatus.ACTIVE

    if (!fullName || !email || !password || !role) {
      return apiError("fullName, email, password and role are required", 400)
    }

    const created = await prisma.user.create({
      data: {
        schoolId: sessionUser.schoolId,
        fullName,
        email,
        passwordHash: password,
        role,
        status,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        schoolId: true,
      },
    })

    if (role === UserRole.STUDENT) {
      await prisma.studentProfile.create({
        data: {
          schoolId: sessionUser.schoolId,
          userId: created.id,
          grade: body.grade,
          section: body.section,
          rollNumber: body.rollNumber,
        },
      })
    }

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return apiError("Unauthorized", 401)
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return apiError("Email already exists in this school", 409)
    }
    return apiError("Internal server error", 500)
  }
}
