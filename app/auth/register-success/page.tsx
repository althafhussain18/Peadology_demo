import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GraduationCap, Mail, Sparkles, CheckCircle2 } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-primary/10 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-secondary opacity-30">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 text-accent opacity-25">
          <CheckCircle2 className="w-20 h-20" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary rounded-2xl p-3 shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <span
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LearnQuest
            </span>
          </Link>
        </div>

        <Card className="border-2 border-accent/30 shadow-2xl bg-card/95 backdrop-blur-sm text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-accent/20 rounded-full p-6">
                <Mail className="w-12 h-12 text-accent" />
              </div>
            </div>
            <CardTitle 
              className="text-3xl text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Check Your Email!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg">
              We have sent a confirmation link to your email address. 
              Please check your inbox and click the link to activate your account.
            </p>

            <div className="bg-secondary/20 rounded-xl p-4">
              <p className="text-sm text-foreground">
                Did not receive the email? Check your spam folder or{' '}
                <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                  try again
                </Link>
              </p>
            </div>

            <Button asChild className="w-full h-12 rounded-xl text-lg font-semibold">
              <Link href="/auth/sign-in">
                Go to Sign In
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-12 rounded-xl">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
