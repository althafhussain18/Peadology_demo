import { Prisma, RecordStatus, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureRegisterBootstrap } from "@/lib/auth/register-bootstrap"

type RegisterBody = {
  fullName?: string
  email?: string
  password?: string
  role?: string
  subjectIds?: string[]
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const role = typeof body.role === "string" ? body.role.toUpperCase() : ""
    const subjectIds = Array.isArray(body.subjectIds)
      ? body.subjectIds.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : []

    if (!fullName) {
      return badRequest("Full name is required")
    }

    if (!email) {
      return badRequest("Email is required")
    }

    if (!password) {
      return badRequest("Password is required")
    }

    const allowedRoles = new Set<UserRole>([
      UserRole.ADMIN,
      UserRole.TEACHER,
      UserRole.STUDENT,
      UserRole.PARENT,
    ])

    if (!allowedRoles.has(role as UserRole)) {
      return badRequest("Invalid role")
    }

    const school = await ensureRegisterBootstrap()

    const existingUser = await prisma.user.findFirst({
      where: {
        schoolId: school.id,
        email,
      },
      select: { id: true },
    })

    if (existingUser) {
      return badRequest("An account already exists with this email")
    }

    if (role === UserRole.TEACHER && subjectIds.length === 0) {
      return badRequest("Please select at least one subject for teacher role")
    }

    let validSubjectIds: string[] = []
    if (role === UserRole.TEACHER) {
      const subjects = await prisma.subject.findMany({
        where: {
          schoolId: school.id,
          status: RecordStatus.ACTIVE,
          id: { in: subjectIds },
        },
        select: { id: true },
      })
      validSubjectIds = subjects.map((subject) => subject.id)

      if (validSubjectIds.length !== subjectIds.length) {
        return badRequest("One or more selected subjects are invalid")
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          fullName,
          email,
          passwordHash,
          role: role as UserRole,
          status: RecordStatus.ACTIVE,
        },
      })

      if (role === UserRole.TEACHER && validSubjectIds.length > 0) {
        await tx.teacherSubject.createMany({
          data: validSubjectIds.map((subjectId) => ({
            schoolId: school.id,
            teacherId: user.id,
            subjectId,
          })),
        })
      }
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("Register API error", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return badRequest("An account already exists with this email")
      }
      if (error.code === "P2021") {
        return NextResponse.json(
          { error: "Database schema is missing tables. Run migrations." },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
