"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { ArrowLeft, BookOpen, Clock3, MessageSquare, UserRound } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ParentChild = {
  studentId: string
  fullName: string
  email: string
  relationship: string
  grade: string | null
  section: string | null
  rollNumber: string | null
}

type ParentOverview = {
  student: ParentChild
  stats: {
    enrolledCourses: number
    completedLessons: number
    lessonMinutes: number
    videoMinutes: number
    booksOpened: number
    avgProgressPct: number
  }
  subjects: Array<{
    id: string
    code: string
    name: string
    teachers: Array<{ id: string; fullName: string }>
  }>
}

type ParentActivity = {
  id: string
  title: string
  type: string
  activityType: string
  watchMinutes: number
  subject: string | null
  at: string
}

type ParentFeedback = {
  id: string
  studentId: string
  teacherId: string | null
  subjectId: string | null
  message: string
  status: "OPEN" | "READ" | "RESOLVED"
  createdAt: string
  subject: { id: string; code: string; name: string } | null
  teacher: { id: string; fullName: string } | null
}

export function ParentDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [overview, setOverview] = useState<ParentOverview | null>(null)
  const [activity, setActivity] = useState<ParentActivity[]>([])
  const [feedback, setFeedback] = useState<ParentFeedback[]>([])
  const [subjectId, setSubjectId] = useState<string>("")
  const [teacherId, setTeacherId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const sessionName = session?.user?.fullName ?? "Parent"
  const roleLabel = session?.user?.role
    ? `${session.user.role[0]}${session.user.role.slice(1).toLowerCase()}`
    : "Parent"

  const selectedSubjectTeachers = useMemo(() => {
    if (!overview || !subjectId) {
      return [] as Array<{ id: string; fullName: string }>
    }
    return overview.subjects.find((subject) => subject.id === subjectId)?.teachers ?? []
  }, [overview, subjectId])

  const loadChildData = async (studentId: string) => {
    const [overviewRes, activityRes, feedbackRes] = await Promise.all([
      fetch(`/api/dashboard/parent/overview?studentId=${encodeURIComponent(studentId)}`),
      fetch(`/api/dashboard/parent/activity?studentId=${encodeURIComponent(studentId)}`),
      fetch(`/api/parent/feedback?studentId=${encodeURIComponent(studentId)}`),
    ])

    if (!overviewRes.ok || !activityRes.ok || !feedbackRes.ok) {
      throw new Error("Failed to load parent dashboard data")
    }

    const overviewJson = (await overviewRes.json()) as { data: ParentOverview | null }
    const activityJson = (await activityRes.json()) as { data: ParentActivity[] }
    const feedbackJson = (await feedbackRes.json()) as { data: ParentFeedback[] }

    setOverview(overviewJson.data)
    setActivity(activityJson.data)
    setFeedback(feedbackJson.data)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const childrenRes = await fetch("/api/dashboard/parent/children")
        if (!childrenRes.ok) {
          throw new Error("Failed to load children")
        }

        const childrenJson = (await childrenRes.json()) as { data: ParentChild[] }
        setChildren(childrenJson.data)

        if (childrenJson.data.length > 0) {
          const firstStudentId = childrenJson.data[0].studentId
          setSelectedStudentId(firstStudentId)
          await loadChildData(firstStudentId)
        } else {
          setOverview(null)
          setActivity([])
          setFeedback([])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId)
    setLoading(true)
    setError(null)
    setSubjectId("")
    setTeacherId("")
    setMessage("")
    try {
      await loadChildData(studentId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load child data")
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedStudentId || !message.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const res = await fetch("/api/parent/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          subjectId: subjectId || null,
          teacherId: teacherId || null,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(errJson?.error ?? "Failed to send feedback")
      }

      setMessage("")
      await loadChildData(selectedStudentId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const statusClass = (status: ParentFeedback["status"]) => {
    if (status === "RESOLVED") {
      return "border-emerald-300/50 bg-emerald-500/10 text-emerald-700"
    }
    if (status === "READ") {
      return "border-blue-300/50 bg-blue-500/10 text-blue-700"
    }
    return "border-amber-300/50 bg-amber-500/10 text-amber-700"
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
                <UserRound className="w-4 h-4" />
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

      <main className="container mx-auto px-4 py-8 space-y-6">
        {loading ? <p className="text-muted-foreground">Loading dashboard...</p> : null}
        {error ? <p className="text-destructive">{error}</p> : null}

        {!loading && children.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Linked Child</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ask school admin to link your parent account with your child.
            </CardContent>
          </Card>
        ) : null}

        {!loading && children.length > 0 ? (
          <>
            <section className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="text-sm font-medium" htmlFor="child-select">
                Child
              </label>
              <select
                id="child-select"
                className="w-full md:w-80 h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedStudentId}
                onChange={(event) => handleStudentChange(event.target.value)}
              >
                {children.map((child) => (
                  <option key={child.studentId} value={child.studentId}>
                    {child.fullName} ({child.relationship.toLowerCase()})
                  </option>
                ))}
              </select>
            </section>

            {overview ? (
              <>
                <section className="space-y-1">
                  <h1 className="text-3xl font-bold">{overview.student.fullName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {overview.student.grade ?? "N/A"}
                    {overview.student.section ? ` • Section ${overview.student.section}` : ""}
                    {overview.student.rollNumber ? ` • ${overview.student.rollNumber}` : ""}
                  </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
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
                      <CardTitle className="text-sm text-muted-foreground">Avg Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">{overview.stats.avgProgressPct}%</CardContent>
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
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Send Feedback To Teacher
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium" htmlFor="feedback-subject">
                            Subject
                          </label>
                          <select
                            id="feedback-subject"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            value={subjectId}
                            onChange={(event) => {
                              const next = event.target.value
                              setSubjectId(next)
                              const isTeacherValidForSubject = overview.subjects
                                .find((subject) => subject.id === next)
                                ?.teachers.some((teacher) => teacher.id === teacherId)
                              if (teacherId && !isTeacherValidForSubject) {
                                setTeacherId("")
                              }
                            }}
                          >
                            <option value="">Select subject (optional)</option>
                            {overview.subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium" htmlFor="feedback-teacher">
                            Teacher
                          </label>
                          <select
                            id="feedback-teacher"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            value={teacherId}
                            onChange={(event) => setTeacherId(event.target.value)}
                          >
                            <option value="">Auto assign / Any teacher</option>
                            {selectedSubjectTeachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium" htmlFor="feedback-message">
                            Message
                          </label>
                          <Textarea
                            id="feedback-message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Write your feedback or concern for the teacher."
                            rows={4}
                          />
                        </div>

                        <Button type="submit" className="rounded-full" disabled={submitting || !message.trim()}>
                          {submitting ? "Sending..." : "Send Feedback"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock3 className="w-5 h-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activity.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No activity yet.</p>
                      ) : (
                        activity.slice(0, 6).map((item) => (
                          <div key={item.id} className="rounded-xl border border-border p-3">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.subject ?? "General"} • {item.type} • {item.watchMinutes} min
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="xl:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Feedback History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {feedback.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No feedback sent yet.</p>
                      ) : (
                        feedback.map((item) => (
                          <div key={item.id} className="rounded-xl border border-border p-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full border ${statusClass(item.status)}`}>
                                {item.status}
                              </span>
                              {item.subject ? (
                                <span className="text-xs px-2 py-1 rounded-full border border-border bg-muted/40">
                                  {item.subject.name}
                                </span>
                              ) : null}
                              {item.teacher ? (
                                <span className="text-xs px-2 py-1 rounded-full border border-border bg-muted/40">
                                  {item.teacher.fullName}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm">{item.message}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </section>
              </>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  )
}
