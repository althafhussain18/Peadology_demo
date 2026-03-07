"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, ArrowLeft, BookOpen, Clock3, GraduationCap, Users } from "lucide-react"
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

type TeacherOverviewResponse = {
  data: {
    user: {
      userId: string
      fullName: string
      role: string
      schoolId: string
    }
    stats: {
      totalStudents: number
      subjectsTaught: number
      publishedContent: number
      draftContent: number
      recentActivities: number
    }
    subjects: Array<{ id: string; code: string; name: string }>
  }
}

type TeacherStudent = {
  studentId: string
  fullName: string
  email: string
  grade: string | null
  section: string | null
  rollNumber: string | null
  subjects: Array<{ id: string; code: string; name: string }>
  avgProgressPct: number
  lastActivityAt: string | null
  atRisk: boolean
}

type TeacherActivity = {
  id: string
  studentName: string
  title: string
  contentType: string
  activityType: string
  watchMinutes: number
  subject: string | null
  at: string
}

type TeacherFeedback = {
  id: string
  message: string
  status: "OPEN" | "READ" | "RESOLVED"
  createdAt: string
  parent: { id: string; fullName: string }
  student: { id: string; fullName: string }
  subject: { id: string; code: string; name: string } | null
}

export function TeacherDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<TeacherOverviewResponse["data"] | null>(null)
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [activity, setActivity] = useState<TeacherActivity[]>([])
  const [feedback, setFeedback] = useState<TeacherFeedback[]>([])

  const loadFeedback = async () => {
    const feedbackRes = await fetch("/api/teacher/feedback")
    if (!feedbackRes.ok) {
      throw new Error("Failed to load teacher feedback")
    }
    const feedbackJson = (await feedbackRes.json()) as { data: TeacherFeedback[] }
    setFeedback(feedbackJson.data)
  }

  const updateFeedbackStatus = async (feedbackId: string, status: TeacherFeedback["status"]) => {
    try {
      const res = await fetch(`/api/teacher/feedback/${encodeURIComponent(feedbackId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        throw new Error("Failed to update feedback status")
      }
      await loadFeedback()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update feedback status")
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [overviewRes, studentsRes, activityRes, feedbackRes] = await Promise.all([
          fetch("/api/dashboard/teacher/overview"),
          fetch("/api/dashboard/teacher/students"),
          fetch("/api/dashboard/teacher/activity"),
          fetch("/api/teacher/feedback"),
        ])

        if (!overviewRes.ok || !studentsRes.ok || !activityRes.ok || !feedbackRes.ok) {
          throw new Error("Failed to load teacher dashboard data")
        }

        const overviewJson = (await overviewRes.json()) as TeacherOverviewResponse
        const studentsJson = (await studentsRes.json()) as { data: TeacherStudent[] }
        const activityJson = (await activityRes.json()) as { data: TeacherActivity[] }
        const feedbackJson = (await feedbackRes.json()) as { data: TeacherFeedback[] }

        setOverview(overviewJson.data)
        setStudents(studentsJson.data)
        setActivity(activityJson.data)
        setFeedback(feedbackJson.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const atRiskCount = useMemo(() => students.filter((student) => student.atRisk).length, [students])
  const openFeedbackCount = useMemo(() => feedback.filter((item) => item.status === "OPEN").length, [feedback])
  const sessionName = session?.user?.fullName ?? overview?.user.fullName ?? "Teacher"
  const roleLabel = session?.user?.role
    ? `${session.user.role[0]}${session.user.role.slice(1).toLowerCase()}`
    : "Teacher"

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

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
              <p className="text-muted-foreground">Track students, subjects, and classroom activity.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">My Students</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.totalStudents}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Subjects</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.subjectsTaught}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Published Content</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.publishedContent}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Draft Content</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.draftContent}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Recent Activity (7d)</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{overview.stats.recentActivities}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">At-Risk Students</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-destructive">{atRiskCount}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Open Parent Feedback</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{openFeedbackCount}</CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Subjects Taught
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {overview.subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
                  ) : (
                    overview.subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="text-xs px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary font-medium"
                      >
                        {subject.name}
                      </span>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-primary" />
                    Recent Student Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  ) : (
                    activity.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-3">
                        <p className="font-medium text-sm">
                          {item.studentName} - {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.subject ?? "General"} • {item.contentType} • {item.watchMinutes} min
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    My Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No students mapped to your subjects.</p>
                  ) : (
                    students.map((student) => (
                      <div key={student.studentId} className="rounded-xl border border-border p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.grade ?? "N/A"} {student.section ? `• Section ${student.section}` : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full border border-border">
                              {student.avgProgressPct}% avg progress
                            </span>
                            {student.atRisk ? (
                              <span className="text-xs px-2 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                At Risk
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {student.subjects.map((subject) => (
                            <span
                              key={`${student.studentId}-${subject.id}`}
                              className="text-xs px-2 py-1 rounded-full border border-border bg-muted/50"
                            >
                              {subject.name}
                            </span>
                          ))}
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
                    Parent Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedback.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No feedback from parents yet.</p>
                  ) : (
                    feedback.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <p className="text-sm font-semibold">
                            {item.parent.fullName} about {item.student.fullName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full border border-border bg-muted/50">
                              {item.subject?.name ?? "General"}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{item.message}</p>
                        <div className="mt-3 flex items-center gap-2">
                          {item.status !== "READ" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateFeedbackStatus(item.id, "READ")}
                            >
                              Mark Read
                            </Button>
                          ) : null}
                          {item.status !== "RESOLVED" ? (
                            <Button size="sm" onClick={() => updateFeedbackStatus(item.id, "RESOLVED")}>
                              Mark Resolved
                            </Button>
                          ) : null}
                        </div>
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
