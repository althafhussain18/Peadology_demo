"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Microscope, BookOpen, Globe, Palette, Music, LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

export type Subject = {
  id: string
  name: string
  icon: LucideIcon
  lessons: number
  color: string
  lightColor: string
  description: string
}

export const subjects: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    lessons: 48,
    color: "bg-chart-1",
    lightColor: "bg-chart-1/10",
    description: "Numbers, shapes & puzzles",
  },
  {
    id: "science",
    name: "Science",
    icon: Microscope,
    lessons: 36,
    color: "bg-accent",
    lightColor: "bg-accent/10",
    description: "Discover how things work",
  },
  {
    id: "english",
    name: "English",
    icon: BookOpen,
    lessons: 52,
    color: "bg-chart-4",
    lightColor: "bg-chart-4/10",
    description: "Reading & writing fun",
  },
  {
    id: "social-studies",
    name: "Social Studies",
    icon: Globe,
    lessons: 30,
    color: "bg-secondary",
    lightColor: "bg-secondary/10",
    description: "Explore the world",
  },
  {
    id: "art-craft",
    name: "Art & Craft",
    icon: Palette,
    lessons: 24,
    color: "bg-chart-5",
    lightColor: "bg-chart-5/10",
    description: "Create amazing things",
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    lessons: 18,
    color: "bg-primary",
    lightColor: "bg-primary/10",
    description: "Learn rhythm & melody",
  },
]

interface SubjectCardsProps {
  onSelectCourse?: (courseId: string) => void
}

export function SubjectCards({ onSelectCourse }: SubjectCardsProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [courseProgressById, setCourseProgressById] = useState<Record<string, number>>({})
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([])
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

  const isStudent = session?.user?.role === "STUDENT"
  const isTeacher = session?.user?.role === "TEACHER"

  useEffect(() => {
    const loadEnrollments = async () => {
      if (status !== "authenticated" || !isStudent) {
        setEnrolledCourseIds([])
        return
      }

      const response = await fetch("/api/student/enrollments")
      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as {
        data: Array<{ courseId: string }>
      }
      setEnrolledCourseIds(payload.data.map((item) => item.courseId))

      const learningResponse = await fetch("/api/dashboard/student/learning")
      if (learningResponse.ok) {
        const learningPayload = (await learningResponse.json()) as {
          data: Array<{ courseId: string; completionPct: number; status: string }>
        }
        const progressMap: Record<string, number> = {}
        const completed: string[] = []
        for (const item of learningPayload.data) {
          progressMap[item.courseId] = item.completionPct
          if (item.status === "COMPLETED" || item.completionPct >= 100) {
            completed.push(item.courseId)
          }
        }
        setCourseProgressById(progressMap)
        setCompletedCourseIds(completed)
      }
    }

    loadEnrollments()
  }, [status, isStudent])

  const enrolledSet = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds])

  const handleEnroll = async (courseId: string, courseName: string, event: React.MouseEvent) => {
    event.stopPropagation()

    if (status !== "authenticated") {
      router.push("/auth/sign-in")
      return
    }

    if (!isStudent) {
      if (isTeacher) {
        onSelectCourse?.(courseId)
        return
      }
      toast({
        title: "Only students can enroll",
        description: "Please login as a student account to enroll in courses.",
      })
      return
    }

    if (enrolledSet.has(courseId)) {
      onSelectCourse?.(courseId)
      return
    }

    try {
      setEnrollingCourseId(courseId)
      const response = await fetch("/api/student/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        toast({
          title: "Enrollment failed",
          description: payload.error ?? "Unable to enroll now.",
        })
        return
      }

      setEnrolledCourseIds((prev) => [...new Set([...prev, courseId])])
      setCourseProgressById((prev) => ({ ...prev, [courseId]: Math.max(prev[courseId] ?? 0, 0) }))
      toast({
        title: "Enrolled successfully",
        description: `You are now enrolled in ${courseName}.`,
      })
    } finally {
      setEnrollingCourseId(null)
    }
  }

  return (
    <section id="courses" className="py-12 scroll-mt-20">
      <div className="text-center mb-10">
        <h2
          className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Choose Your Subject
        </h2>
        <p className="text-muted-foreground text-lg">Pick a subject and start your learning adventure!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {subjects.map((subject) => {
          const Icon = subject.icon
          const progressPct = courseProgressById[subject.id] ?? 0
          const isCompleted = completedCourseIds.includes(subject.id)
          const isEnrolled = enrolledSet.has(subject.id)
          const teacherView = status === "authenticated" && isTeacher
          return (
            <Card 
              key={subject.id}
              onClick={() => onSelectCourse?.(subject.id)}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 overflow-hidden h-full"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`${subject.lightColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={`${subject.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{subject.description}</p>
                <span
                  className={`inline-block ${subject.lightColor} text-xs font-medium px-3 py-1 rounded-full`}
                >
                  {subject.lessons} Lessons
                </span>
                {isEnrolled ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {isCompleted ? "Progress: 100% (Completed)" : `Progress: ${progressPct}%`}
                  </p>
                ) : null}
                <div className="mt-3">
                  <Button
                    size="sm"
                    className="rounded-full w-full"
                    variant={isEnrolled || teacherView ? "outline" : "default"}
                    onClick={(event) => handleEnroll(subject.id, subject.name, event)}
                    disabled={enrollingCourseId === subject.id}
                  >
                    {teacherView
                      ? "View Course"
                      : enrollingCourseId === subject.id
                      ? "Enrolling..."
                      : isCompleted
                        ? "Completed"
                        : isEnrolled
                          ? "Start Learning"
                        : "Enroll"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
