"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  BookOpen,
  List,
  X,
} from "lucide-react"
import { subjects, Subject } from "@/components/subject-cards"
import { courseLessons, Lesson } from "@/lib/lessons-data"

interface LessonViewProps {
  courseId: string
  lessonId: string
  onBack: () => void
  onSelectLesson: (lessonId: string) => void
  onBackToCourse: () => void
}

export function LessonView({ courseId, lessonId, onBack, onSelectLesson, onBackToCourse }: LessonViewProps) {
  const [showSidebar, setShowSidebar] = useState(false)

  const subject = subjects.find((s) => s.id === courseId) as Subject
  const lessons = courseLessons[courseId] as Lesson[]
  const currentLessonIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1
  const lesson = lessons?.[currentLessonIndex]

  if (!subject || !lessons || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lesson not found</h1>
          <Button onClick={onBack}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const Icon = subject.icon
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null
  const lessonDurationMinutes = Number.parseInt(lesson.duration, 10) || 20
  const totalSeconds = Math.max(lessonDurationMinutes * 60, 60)
  const elapsedSecondsRef = useRef(0)
  const sentMinutesRef = useRef(0)
  const sentProgressRef = useRef(0)

  const sendProgress = async (markCompleted = false) => {
    const progressPct = markCompleted
      ? 100
      : Math.min(99, Math.max(1, Math.round((elapsedSecondsRef.current / totalSeconds) * 100)))
    const totalMinutes = Math.floor(elapsedSecondsRef.current / 60)
    const minutesSpent = Math.max(0, totalMinutes - sentMinutesRef.current)
    const shouldSend = markCompleted || minutesSpent > 0 || progressPct > sentProgressRef.current

    if (!shouldSend) {
      return
    }

    await fetch("/api/student/progress/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        lessonId,
        lessonTitle: lesson.title,
        progressPct,
        completed: markCompleted,
        minutesSpent,
      }),
      keepalive: true,
    })

    sentProgressRef.current = progressPct
    if (minutesSpent > 0) {
      sentMinutesRef.current += minutesSpent
    }
  }

  useEffect(() => {
    sentProgressRef.current = 0
    sentMinutesRef.current = 0
    elapsedSecondsRef.current = 0

    void sendProgress(false)

    const timer = window.setInterval(() => {
      elapsedSecondsRef.current += 15
      void sendProgress(false)
    }, 15000)

    return () => {
      window.clearInterval(timer)
      void sendProgress(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId])

  const handleNavigate = async (targetLessonId: string) => {
    const targetIndex = lessons.findIndex((item) => item.id === targetLessonId)
    const movingForward = targetIndex > currentLessonIndex
    await sendProgress(movingForward)
    onSelectLesson(targetLessonId)
  }

  const handleCompleteCourse = async () => {
    await sendProgress(true)
    onBack()
  }

  const handleBackToCourse = async () => {
    await sendProgress(false)
    onBackToCourse()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className={`${subject.color} text-white sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => void handleBackToCourse()}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{subject.name}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">
                Lesson {currentLessonIndex + 1} of {lessons.length}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 lg:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>{lesson.duration} minutes</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {lesson.title}
            </h1>
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          </div>

          {/* Lesson Content */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-lg max-w-none">
                {lesson.content.split('\n').map((line, index) => {
                  const trimmedLine = line.trim()
                  
                  if (!trimmedLine) {
                    return <div key={index} className="h-2" />
                  }
                  
                  if (trimmedLine.startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-3xl font-bold text-foreground mt-6 mb-4 first:mt-0" style={{ fontFamily: "var(--font-display)" }}>
                        {trimmedLine.slice(2)}
                      </h1>
                    )
                  }
                  
                  if (trimmedLine.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold text-foreground mt-6 mb-3">
                        {trimmedLine.slice(3)}
                      </h2>
                    )
                  }
                  
                  if (trimmedLine.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-xl font-semibold text-foreground mt-4 mb-2">
                        {trimmedLine.slice(4)}
                      </h3>
                    )
                  }
                  
                  if (trimmedLine.startsWith('- ')) {
                    const content = trimmedLine.slice(2)
                    const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    return (
                      <div key={index} className="flex items-start gap-2 ml-4 mb-1">
                        <span className={`w-2 h-2 rounded-full ${subject.color} mt-2 flex-shrink-0`} />
                        <span 
                          className="text-foreground/80"
                          dangerouslySetInnerHTML={{ __html: formattedContent }}
                        />
                      </div>
                    )
                  }
                  
                  if (/^\d+\./.test(trimmedLine)) {
                    const content = trimmedLine.replace(/^\d+\.\s*/, '')
                    const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    return (
                      <div key={index} className="flex items-start gap-2 ml-4 mb-1">
                        <span className={`font-bold ${subject.color.replace('bg-', 'text-')}`}>
                          {trimmedLine.match(/^\d+/)?.[0]}.
                        </span>
                        <span 
                          className="text-foreground/80"
                          dangerouslySetInnerHTML={{ __html: formattedContent }}
                        />
                      </div>
                    )
                  }
                  
                  const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  return (
                    <p 
                      key={index} 
                      className="text-foreground/80 mb-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formattedLine }}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            {prevLesson ? (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => void handleNavigate(prevLesson.id)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                className={`${subject.color} hover:opacity-90 text-white flex items-center gap-2`}
                onClick={() => void handleNavigate(nextLesson.id)}
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className={`${subject.color} hover:opacity-90 text-white flex items-center gap-2`}
                onClick={() => void handleCompleteCourse()}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Course</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-l border-border bg-card">
          <div className="sticky top-16 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h3 className="font-bold text-foreground mb-4">All Lessons</h3>
            <div className="space-y-2">
              {lessons.map((l, index) => (
                <button
                  key={l.id}
                  onClick={() => void handleNavigate(l.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    l.id === lessonId
                      ? `${subject.lightColor} border-2 border-primary/30`
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        l.id === lessonId ? subject.color + " text-white" : "bg-muted"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {l.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">All Lessons</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                {lessons.map((l, index) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      void handleNavigate(l.id)
                      setShowSidebar(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? `${subject.lightColor} border-2 border-primary/30`
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          l.id === lessonId ? subject.color + " text-white" : "bg-muted"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {l.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
