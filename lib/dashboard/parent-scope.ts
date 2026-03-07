import { prisma } from "@/lib/prisma"

export async function getParentChildren(params: { schoolId: string; parentId: string }) {
  const { schoolId, parentId } = params

  return prisma.parentStudentLink.findMany({
    where: { schoolId, parentId },
    include: {
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
    orderBy: { student: { fullName: "asc" } },
  })
}

export async function assertParentOwnsStudent(params: {
  schoolId: string
  parentId: string
  studentId: string
}) {
  const { schoolId, parentId, studentId } = params
  const link = await prisma.parentStudentLink.findFirst({
    where: {
      schoolId,
      parentId,
      studentId,
    },
    select: { id: true },
  })

  if (!link) {
    throw new Error("FORBIDDEN")
  }
}
