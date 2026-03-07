import { Prisma, RecordStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const DEFAULT_SCHOOL_NAME = process.env.DEFAULT_SCHOOL_NAME?.trim() || "LearnQuest School"
const DEFAULT_SCHOOL_CODE = process.env.DEFAULT_SCHOOL_CODE?.trim() || "LQ-DEFAULT"

type ActiveSchool = { id: string }

async function findActiveSchool(): Promise<ActiveSchool | null> {
  return prisma.school.findFirst({
    where: { status: RecordStatus.ACTIVE },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })
}

async function ensureActiveSchool(): Promise<ActiveSchool> {
  const activeSchool = await findActiveSchool()
  if (activeSchool) return activeSchool

  const firstSchool = await prisma.school.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })

  if (firstSchool) {
    const updated = await prisma.school.update({
      where: { id: firstSchool.id },
      data: { status: RecordStatus.ACTIVE },
      select: { id: true },
    })
    return updated
  }

  try {
    const created = await prisma.school.create({
      data: {
        name: DEFAULT_SCHOOL_NAME,
        code: DEFAULT_SCHOOL_CODE,
        status: RecordStatus.ACTIVE,
      },
      select: { id: true },
    })
    return created
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const racedSchool =
        (await findActiveSchool()) ??
        (await prisma.school.findFirst({
          where: { code: DEFAULT_SCHOOL_CODE },
          select: { id: true },
          orderBy: { createdAt: "asc" },
        }))

      if (racedSchool) return racedSchool
    }

    throw error
  }
}

export async function ensureRegisterBootstrap() {
  const school = await ensureActiveSchool()

  await prisma.subject.createMany({
    data: [
      {
        schoolId: school.id,
        name: "Mathematics",
        code: "MATH",
        status: RecordStatus.ACTIVE,
      },
      {
        schoolId: school.id,
        name: "Science",
        code: "SCIENCE",
        status: RecordStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  })

  return school
}
