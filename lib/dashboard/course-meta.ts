export const COURSE_LABELS: Record<string, string> = {
  mathematics: "Mathematics",
  science: "Science",
  english: "English",
  "social-studies": "Social Studies",
  "art-craft": "Art & Craft",
  music: "Music",
}

export function getCourseLabel(courseId: string) {
  return COURSE_LABELS[courseId] ?? courseId
}

export const COURSE_SUBJECT_CODES: Record<string, string> = {
  mathematics: "MATH",
  science: "SCIENCE",
  english: "ENGLISH",
  "social-studies": "SOCIAL_STUDIES",
  "art-craft": "ART_CRAFT",
  music: "MUSIC",
}

export function getCourseSubjectCode(courseId: string) {
  return COURSE_SUBJECT_CODES[courseId] ?? null
}
