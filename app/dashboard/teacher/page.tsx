import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { TeacherDashboard } from "@/components/teacher-dashboard"

export default async function TeacherDashboardPage() {
  const session = await auth()

  if (!session?.user?.userId) {
    redirect("/auth/sign-in")
  }

  if (session.user.role !== UserRole.TEACHER) {
    redirect("/")
  }

  return <TeacherDashboard />
}
