import { NextResponse } from "next/server"
import { RecordStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const school = await prisma.school.findFirst({
      where: { status: RecordStatus.ACTIVE },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })

    if (!school) {
      return NextResponse.json({ data: { subjects: [] } })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId: school.id,
        status: RecordStatus.ACTIVE,
      },
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: { subjects } })
  } catch {
    return NextResponse.json({ error: "Failed to load register options" }, { status: 500 })
  }
}
