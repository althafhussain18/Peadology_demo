import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { SessionUser } from "@/lib/auth/session"

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function requireRole(sessionUser: SessionUser, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(sessionUser.role)) {
    throw new Error("FORBIDDEN")
  }
}
