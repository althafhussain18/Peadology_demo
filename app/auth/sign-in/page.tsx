'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GraduationCap, Eye, EyeOff, Sparkles, BookOpen, Star, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!response || response.error) {
        setError('Invalid email or password')
        return
      }

      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="fixed top-4 left-4 z-20">
        <Button variant="outline" className="rounded-full gap-2" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-secondary opacity-30">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-primary opacity-20">
          <BookOpen className="w-20 h-20" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-accent opacity-25">
          <Star className="w-12 h-12 animate-bounce" />
        </div>
        <div className="absolute bottom-20 right-10 text-secondary opacity-30">
          <GraduationCap className="w-24 h-24" />
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

        <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className="text-3xl text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="your.email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-2 border-border focus:border-primary transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  New to LearnQuest?{' '}
                  <Link
                    href="/auth/register"
                    className="text-primary font-semibold hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
