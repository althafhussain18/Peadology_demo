import { prisma } from "@/lib/prisma"

export async function getTeacherScope(params: { schoolId: string; teacherId: string }) {
  const { schoolId, teacherId } = params

  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { schoolId, teacherId },
    include: {
      subject: { select: { id: true, code: true, name: true } },
    },
    orderBy: { subject: { name: "asc" } },
  })

  const subjectIds = teacherSubjects.map((item) => item.subjectId)
  if (subjectIds.length === 0) {
    return {
      subjectIds,
      subjects: [] as Array<{ id: string; code: string; name: string }>,
      studentIds: [] as string[],
    }
  }

  const studentSubjects = await prisma.studentSubject.findMany({
    where: {
      schoolId,
      subjectId: { in: subjectIds },
    },
    select: { studentId: true },
  })

  const studentIds = Array.from(new Set(studentSubjects.map((item) => item.studentId)))

  return {
    subjectIds,
    subjects: teacherSubjects.map((item) => item.subject),
    studentIds,
  }
}
