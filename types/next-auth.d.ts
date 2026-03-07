import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      userId: string
      role: UserRole
      schoolId: string
      fullName: string
    }
  }

  interface User {
    role: UserRole
    schoolId: string
    fullName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: UserRole
    schoolId: string
    fullName: string
  }
}
