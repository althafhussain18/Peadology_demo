import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { StudentDashboard } from "@/components/student-dashboard"

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user?.userId) {
    redirect("/auth/sign-in")
  }

  if (session.user.role !== UserRole.STUDENT) {
    redirect("/")
  }

  return <StudentDashboard />
}
