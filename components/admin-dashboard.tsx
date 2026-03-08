"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { ArrowLeft, GraduationCap, ShieldCheck, Unlink, UserRound } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AdminUser = {
  id: string
  fullName: string
  email: string
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"
}

type ParentStudentLink = {
  id: string
  relationship: "MOTHER" | "FATHER" | "GUARDIAN" | "OTHER"
  parent: { id: string; fullName: string; email: string }
  student: {
    id: string
    fullName: string
    email: string
    grade: string | null
    section: string | null
    rollNumber: string | null
  }
}

type School = {
  id: string
  name: string
  code: string
  status: string
}

const relationshipOptions: Array<ParentStudentLink["relationship"]> = [
  "MOTHER",
  "FATHER",
  "GUARDIAN",
  "OTHER",
]

export function AdminDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [parents, setParents] = useState<AdminUser[]>([])
  const [students, setStudents] = useState<AdminUser[]>([])
  const [links, setLinks] = useState<ParentStudentLink[]>([])

  const [parentId, setParentId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [relationship, setRelationship] = useState<ParentStudentLink["relationship"]>("GUARDIAN")

  const sessionName = session?.user?.fullName ?? "Admin"
  const roleLabel = "Admin"

  const loadData = async () => {
    const [schoolRes, parentsRes, studentsRes, linksRes] = await Promise.all([
      fetch("/api/admin/school"),
      fetch("/api/admin/users?role=PARENT"),
      fetch("/api/admin/users?role=STUDENT"),
      fetch("/api/admin/parent-student-links"),
    ])

    if (!schoolRes.ok || !parentsRes.ok || !studentsRes.ok || !linksRes.ok) {
      throw new Error("Failed to load admin data")
    }

    const schoolJson = (await schoolRes.json()) as { data: School }
    const parentsJson = (await parentsRes.json()) as { data: AdminUser[] }
    const studentsJson = (await studentsRes.json()) as { data: AdminUser[] }
    const linksJson = (await linksRes.json()) as { data: ParentStudentLink[] }

    setSchool(schoolJson.data)
    setParents(parentsJson.data)
    setStudents(studentsJson.data)
    setLinks(linksJson.data)
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadData()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const linkedPairSet = useMemo(() => {
    return new Set(links.map((link) => `${link.parent.id}:${link.student.id}`))
  }, [links])

  const handleLink = async (event: FormEvent) => {
    event.preventDefault()
    if (!parentId || !studentId) {
      setError("Select both parent and student")
      return
    }

    try {
      setSaving(true)
      setError(null)
      const response = await fetch("/api/admin/parent-student-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, studentId, relationship }),
      })

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(err?.error ?? "Failed to create link")
      }

      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create link")
    } finally {
      setSaving(false)
    }
  }

  const handleUnlink = async (linkId: string) => {
    try {
      setSaving(true)
      setError(null)
      const response = await fetch(`/api/admin/parent-student-links/${encodeURIComponent(linkId)}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(err?.error ?? "Failed to remove link")
      }
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove link")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: window.location.origin })
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
        {loading ? <p className="text-muted-foreground">Loading admin dashboard...</p> : null}
        {error ? <p className="text-destructive">{error}</p> : null}

        {!loading ? (
          <>
            <section className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                {school ? `${school.name} (${school.code})` : "School"}
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Parents</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{parents.length}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{students.length}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Parent-Student Links</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{links.length}</CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Link Parent To Student
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLink} className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="parent-select" className="text-sm font-medium">
                        Parent
                      </label>
                      <select
                        id="parent-select"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={parentId}
                        onChange={(event) => setParentId(event.target.value)}
                        required
                      >
                        <option value="">Select parent</option>
                        {parents.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.fullName} ({parent.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="student-select" className="text-sm font-medium">
                        Student
                      </label>
                      <select
                        id="student-select"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={studentId}
                        onChange={(event) => setStudentId(event.target.value)}
                        required
                      >
                        <option value="">Select student</option>
                        {students.map((student) => {
                          const isAlreadyLinked = parentId
                            ? linkedPairSet.has(`${parentId}:${student.id}`)
                            : false
                          return (
                            <option key={student.id} value={student.id} disabled={isAlreadyLinked}>
                              {student.fullName} ({student.email}) {isAlreadyLinked ? "- already linked" : ""}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="relationship-select" className="text-sm font-medium">
                        Relationship
                      </label>
                      <select
                        id="relationship-select"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={relationship}
                        onChange={(event) =>
                          setRelationship(event.target.value as ParentStudentLink["relationship"])
                        }
                      >
                        {relationshipOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button type="submit" disabled={saving} className="rounded-full">
                      {saving ? "Saving..." : "Create Link"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {links.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No parent-student links found.</p>
                  ) : (
                    links.map((link) => (
                      <div key={link.id} className="rounded-xl border border-border p-3">
                        <p className="font-medium">{link.parent.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.relationship} - {link.student.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {link.student.grade ?? "N/A"}
                          {link.student.section ? ` • Section ${link.student.section}` : ""}
                          {link.student.rollNumber ? ` • ${link.student.rollNumber}` : ""}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full mt-2"
                          onClick={() => handleUnlink(link.id)}
                          disabled={saving}
                        >
                          <Unlink className="w-4 h-4" />
                          Remove Link
                        </Button>
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
