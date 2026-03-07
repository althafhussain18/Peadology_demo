"use client"

import { SessionProvider } from "next-auth/react"

type Props = {
  children: React.ReactNode
}

export function AuthSessionProvider({ children }: Props) {
  const Provider = SessionProvider as unknown as React.ComponentType<{ children: React.ReactNode }>
  return <Provider>{children}</Provider>
}
