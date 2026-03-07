import { UserRole } from "@prisma/client"
import { auth } from "@/auth"

export type SessionUser = {
  id: string
  schoolId: string
  role: UserRole
  fullName: string
}

export async function getSessionUser(_request?: Request): Promise<SessionUser> {
  const session = await auth()
  const sessionUser = session?.user

  if (!sessionUser?.userId || !sessionUser.schoolId || !sessionUser.role || !sessionUser.fullName) {
    throw new Error("UNAUTHORIZED")
  }

  return {
    id: sessionUser.userId,
    schoolId: sessionUser.schoolId,
    role: sessionUser.role,
    fullName: sessionUser.fullName,
  }
}
