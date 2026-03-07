import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary rounded-2xl p-3 shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              LearnQuest
            </span>
          </Link>
        </div>

        <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Forgot Password
            </CardTitle>
            <CardDescription className="text-base">
              Password reset email flow is not configured yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              For now, contact your school admin to reset your password.
            </p>
            <Button className="w-full rounded-xl" asChild>
              <Link href="/auth/sign-in">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
