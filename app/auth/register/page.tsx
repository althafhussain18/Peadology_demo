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
import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Eye, EyeOff, Check, X, Sparkles, Rocket, Star, ArrowLeft } from 'lucide-react'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

type RegisterRole = '' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
type RegisterSubject = { id: string; code: string; name: string }

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('')
  const [subjects, setSubjects] = useState<RegisterSubject[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      passed: req.test(password),
    }))
  }, [password])

  const allRequirementsMet = passwordValidation.every((req) => req.passed)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isTeacher = role === 'TEACHER'

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('/api/auth/register/options')
        if (!response.ok) {
          return
        }
        const payload = (await response.json()) as { data: { subjects: RegisterSubject[] } }
        setSubjects(payload.data.subjects)
      } catch {
        // no-op
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!isTeacher && selectedSubjectIds.length > 0) {
      setSelectedSubjectIds([])
    }
  }, [isTeacher, selectedSubjectIds.length])

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!role) {
      setError('Please select a role')
      setIsLoading(false)
      return
    }

    if (!allRequirementsMet) {
      setError('Password does not meet all requirements')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (isTeacher && selectedSubjectIds.length === 0) {
      setError('Please select at least one subject for teacher role')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          role,
          subjectIds: isTeacher ? selectedSubjectIds : [],
        }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(data.error ?? 'Failed to create account')
        return
      }

      window.sessionStorage.setItem("register-success-toast", "1")

      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!loginResult || loginResult.error) {
        setError('Account created, but auto sign-in failed. Please sign in manually.')
        router.replace('/auth/sign-in')
        return
      }

      router.replace('/')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-primary/10 flex items-center justify-center p-4 py-8">
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
        <div className="absolute top-16 right-10 text-primary opacity-20">
          <Rocket className="w-20 h-20 rotate-45" />
        </div>
        <div className="absolute top-1/3 left-10 text-secondary opacity-30">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-1/4 text-accent opacity-25">
          <Star className="w-14 h-14 animate-bounce" />
        </div>
        <div className="absolute bottom-10 left-20 text-primary opacity-20">
          <GraduationCap className="w-24 h-24" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
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

        <Card className="border-2 border-accent/20 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle 
              className="text-3xl text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Join LearnQuest!
            </CardTitle>
            <CardDescription className="text-base">
              Create your account and start learning today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                />
              </div>

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
                <Label htmlFor="role" className="text-foreground font-semibold">
                  Role
                </Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as RegisterRole)}
                  required
                  className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm focus:border-primary outline-none transition-colors"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="PARENT">Parent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {isTeacher && (
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold">Subjects</Label>
                  <div className="rounded-xl border-2 border-border bg-background p-3 space-y-2">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No subjects available</p>
                    ) : (
                      subjects.map((subject) => (
                        <label key={subject.id} className="flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedSubjectIds.includes(subject.id)}
                            onChange={() => toggleSubject(subject.id)}
                            className="h-4 w-4"
                          />
                          <span>{subject.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-semibold">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`h-12 rounded-xl border-2 transition-colors pr-12 ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-accent focus:border-accent'
                          : 'border-destructive focus:border-destructive'
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="w-4 h-4" /> Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-sm text-accent flex items-center gap-1">
                    <Check className="w-4 h-4" /> Passwords match
                  </p>
                )}
              </div>

              {/* Password requirements */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground mb-3">Password Requirements:</p>
                <div className="grid gap-2">
                  {passwordValidation.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        req.passed ? 'text-accent' : 'text-muted-foreground'
                      }`}
                    >
                      {req.passed ? (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
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
                disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/sign-in"
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
