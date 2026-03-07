import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user?.userId) {
    redirect("/auth/sign-in")
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/")
  }

  return <AdminDashboard />
}
