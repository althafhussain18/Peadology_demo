import { RecordStatus, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        if (!email || !password) {
          return null
        }

        const users = await prisma.user.findMany({
          where: { email, status: RecordStatus.ACTIVE },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            schoolId: true,
            passwordHash: true,
          },
        })

        if (users.length === 0) {
          return null
        }

        let matchedUser: (typeof users)[number] | null = null
        for (const user of users) {
          const isBcryptHash = user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$") || user.passwordHash.startsWith("$2y$")
          const isValidPassword = isBcryptHash
            ? await bcrypt.compare(password, user.passwordHash)
            : password === user.passwordHash

          if (isValidPassword) {
            if (!isBcryptHash) {
              const upgradedHash = await bcrypt.hash(password, 10)
              await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: upgradedHash },
              })
            }
            matchedUser = user
            break
          }
        }

        if (!matchedUser) {
          return null
        }

        return {
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          schoolId: matchedUser.schoolId,
          fullName: matchedUser.fullName,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = user.role as UserRole
        token.schoolId = user.schoolId
        token.fullName = user.fullName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string
        session.user.role = token.role as UserRole
        session.user.schoolId = token.schoolId as string
        session.user.fullName = token.fullName as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
})
