"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, PlayCircle, BookOpen } from "lucide-react"
import { subjects, Subject } from "@/components/subject-cards"
import { courseLessons, Lesson } from "@/lib/lessons-data"

interface CourseViewProps {
  courseId: string
  onBack: () => void
  onSelectLesson: (lessonId: string) => void
}

export function CourseView({ courseId, onBack, onSelectLesson }: CourseViewProps) {
  const subject = subjects.find((s) => s.id === courseId) as Subject
  const lessons = courseLessons[courseId] as Lesson[]

  if (!subject || !lessons) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course not found</h1>
          <Button onClick={onBack}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  const Icon = subject.icon
  const totalDuration = lessons.reduce((acc, lesson) => {
    const minutes = Number.parseInt(lesson.duration, 10)
    return acc + (Number.isNaN(minutes) ? 0 : minutes)
  }, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`${subject.color} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{subject.name}</h1>
              <p className="text-white/80 text-lg">{subject.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>{lessons.length} Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{totalDuration} minutes total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Course Lessons</h2>

        <div className="grid gap-4">
          {lessons.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30 border-2 border-transparent"
              onClick={() => onSelectLesson(lesson.id)}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`${subject.lightColor} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`font-bold text-lg`} style={{ color: 'var(--foreground)' }}>
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-lg mb-1">{lesson.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}</span>
                    </div>
                    <div className={`${subject.color} w-10 h-10 rounded-full flex items-center justify-center`}>
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Start Learning Button */}
        <div className="mt-8 text-center">
          <Button
            className={`${subject.color} hover:opacity-90 text-white px-8 py-6 text-lg`}
            onClick={() => onSelectLesson(lessons[0].id)}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Start First Lesson
          </Button>
        </div>
      </div>
    </div>
  )
}
