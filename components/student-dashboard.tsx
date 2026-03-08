"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, Clock3, GraduationCap, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OverviewResponse = {
  data: {
    user: {
      userId: string
      fullName: string
      role: string
      schoolId: string
    }
    stats: {
      enrolledCourses: number
      completedLessons: number
      lessonMinutes: number
      videoMinutes: number
      booksOpened: number
    }
  }
}

type LearningCourse = {
  courseId: string
  courseName: string
  status: string
  totalLessons: number
  completedLessons: number
  completionPct: number
  lastLessonId: string | null
}

type LibraryResponse = {
  data: {
    videos: Array<{
      contentItemId: string
      title: string
      subject: string | null
      watchedMinutes: number
      at: string
    }>
    books: Array<{
      contentItemId: string
      title: string
      subject: string | null
      at: string
    }>
  }
}

export function StudentDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<OverviewResponse["data"] | null>(null)
  const [courses, setCourses] = useState<LearningCourse[]>([])
  const [library, setLibrary] = useState<LibraryResponse["data"] | null>(null)
  const sessionName = session?.user?.fullName ?? overview?.user.fullName ?? "Student"
  const roleLabel = session?.user?.role
    ? `${session.user.role[0]}${session.user.role.slice(1).toLowerCase()}`
    : "Student"

  const handleSignOut = async () => {
    await signOut({ callbackUrl: window.location.origin })
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [overviewRes, learningRes, libraryRes] = await Promise.all([
          fetch("/api/dashboard/student/overview"),
          fetch("/api/dashboard/student/learning"),
          fetch("/api/dashboard/student/library"),
        ])

        if (!overviewRes.ok || !learningRes.ok || !libraryRes.ok) {
          throw new Error("Failed to load dashboard data")
        }

        const overviewJson = (await overviewRes.json()) as OverviewResponse
        const learningJson = (await learningRes.json()) as { data: LearningCourse[] }
        const libraryJson = (await libraryRes.json()) as LibraryResponse

        setOverview(overviewJson.data)
        setCourses(learningJson.data)
        setLibrary(libraryJson.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button variant="ghost" asChild className="rounded-full gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="max-w-[180px] truncate">{sessionName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {roleLabel}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <p className="font-semibold">{sessionName}</p>
                <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {isLoading ? <p className="text-muted-foreground">Loading dashboard...</p> : null}
        {error ? <p className="text-destructive">{error}</p> : null}

        {!isLoading && !error && overview ? (
          <>
            <section className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Welcome, {overview.user.fullName}</h1>
              <p className="text-muted-foreground">Track your learning progress, videos, and books in one place.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.enrolledCourses}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Completed Lessons</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.completedLessons}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Lesson Time</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.lessonMinutes} min</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Video Time</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.videoMinutes} min</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Books Opened</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.booksOpened}</CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    My Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No courses enrolled yet.</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.courseId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{course.courseName}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-2 bg-primary rounded-full" style={{ width: `${course.completionPct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{course.completionPct}% completed</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-primary" />
                    Recent Videos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(library?.videos ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No video activity yet.</p>
                  ) : (
                    library?.videos.slice(0, 5).map((video) => (
                      <div key={video.contentItemId} className="rounded-xl border border-border p-3">
                        <p className="font-medium">{video.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{video.subject ?? "General"}</span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="w-3 h-3" />
                            {video.watchedMinutes} min
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Recent Books
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(library?.books ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No book activity yet.</p>
                  ) : (
                    library?.books.slice(0, 6).map((book) => (
                      <div key={book.contentItemId} className="rounded-xl border border-border p-3">
                        <p className="font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{book.subject ?? "General"}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}
