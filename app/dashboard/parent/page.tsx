import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ParentDashboard } from "@/components/parent-dashboard"

export default async function ParentDashboardPage() {
  const session = await auth()

  if (!session?.user?.userId) {
    redirect("/auth/sign-in")
  }

  if (session.user.role !== UserRole.PARENT) {
    redirect("/")
  }

  return <ParentDashboard />
}
