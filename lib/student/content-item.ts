import { ContentStatus, ContentType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const SUBJECT_CODE_BY_NAME: Record<string, string> = {
  mathematics: "MATH",
  science: "SCIENCE",
  english: "ENGLISH",
  "social studies": "SOCIAL_STUDIES",
  "art & craft": "ART_CRAFT",
  music: "MUSIC",
}

function normalizeSubjectCode(subjectName?: string | null) {
  if (!subjectName) {
    return null
  }

  const key = subjectName.trim().toLowerCase()
  return SUBJECT_CODE_BY_NAME[key] ?? null
}

export async function ensureContentItemForActivity(params: {
  schoolId: string
  actorUserId: string
  type: ContentType
  title: string
  subjectName?: string | null
  externalId?: string
}) {
  const { schoolId, actorUserId, type, title, subjectName, externalId } = params

  const existing = await prisma.contentItem.findFirst({
    where: {
      schoolId,
      type,
      title,
    },
    select: { id: true },
  })

  if (existing) {
    return existing.id
  }

  const subjectCode = normalizeSubjectCode(subjectName)
  const subject = subjectCode
    ? await prisma.subject.findFirst({
        where: {
          schoolId,
          code: subjectCode,
        },
        select: { id: true },
      })
    : null

  const created = await prisma.contentItem.create({
    data: {
      schoolId,
      createdById: actorUserId,
      type,
      status: ContentStatus.PUBLISHED,
      title,
      subjectId: subject?.id ?? null,
      metadata: externalId ? { externalId } : undefined,
    },
    select: { id: true },
  })

  return created.id
}
