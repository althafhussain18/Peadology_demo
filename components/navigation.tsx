"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, X, Search, Bell, User, ShoppingCart, Heart, LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-context"
import { useSession, signOut } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Courses", href: "#courses" },
  { name: "Videos", href: "#videos" },
  { name: "Books", href: "#books" },
  { name: "About", href: "#about" },
]

interface NavigationProps {
  onCartClick?: () => void
  onWishlistClick?: () => void
}

type NotificationItem = {
  id: string
  type: "PARENT_FEEDBACK"
  status: "OPEN" | "READ"
  message: string
  createdAt: string
  fromParent: string
  childName: string
  guardianRelationship: string
  subjectName: string | null
}

export function Navigation({ onCartClick, onWishlistClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { cartCount, wishlistCount } = useCart()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const fullName = session?.user?.fullName ?? "User"
  const role = session?.user?.role ?? null

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()

    if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }

    setIsOpen(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const runLandingSearch = (rawQuery: string) => {
    const query = rawQuery.trim().toLowerCase()
    if (!query) {
      return
    }

    const sectionMap: Array<{ keywords: string[]; selector: string }> = [
      { keywords: ["home", "hero"], selector: "#home" },
      { keywords: ["course", "courses", "subject", "math", "science", "english", "history"], selector: "#courses" },
      { keywords: ["video", "videos", "lesson video"], selector: "#videos" },
      { keywords: ["book", "books", "library"], selector: "#books" },
      { keywords: ["about", "about us"], selector: "#about" },
    ]

    const sectionHit = sectionMap.find((item) =>
      item.keywords.some((keyword) => query.includes(keyword) || keyword.includes(query)),
    )
    if (sectionHit) {
      const element = document.querySelector(sectionHit.selector)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
    }

    const searchable = Array.from(
      document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button, main span"),
    ) as HTMLElement[]
    const match = searchable.find((node) => {
      const text = node.textContent?.trim().toLowerCase()
      return Boolean(text && text.includes(query) && node.offsetParent !== null)
    })

    if (match) {
      match.scrollIntoView({ behavior: "smooth", block: "center" })
      match.classList.add("ring-2", "ring-primary", "rounded-md")
      window.setTimeout(() => {
        match.classList.remove("ring-2", "ring-primary", "rounded-md")
      }, 1200)
      return
    }

    toast({
      title: "No results",
      description: `No landing content found for "${rawQuery}"`,
    })
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    runLandingSearch(searchQuery)
  }

  useEffect(() => {
    if (!isAuthenticated || role !== "TEACHER") {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    let active = true
    const loadNotifications = async () => {
      try {
        setNotificationLoading(true)
        const response = await fetch("/api/notifications")
        if (!response.ok) {
          return
        }
        const payload = (await response.json()) as { data: NotificationItem[]; unreadCount: number }
        if (!active) {
          return
        }
        setNotifications(payload.data)
        setUnreadCount(payload.unreadCount)
      } finally {
        if (active) {
          setNotificationLoading(false)
        }
      }
    }

    loadNotifications()
    const interval = window.setInterval(loadNotifications, 20000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [isAuthenticated, role])

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY

        if (Math.abs(delta) > 6) {
          if (delta < 0 && currentY > 80) {
            // Scrolling up: hide navbar.
            setIsNavVisible(false)
          } else {
            // Scrolling down: show navbar.
            setIsNavVisible(true)
          }
          lastScrollY = currentY
        }

        if (currentY <= 10) {
          setIsNavVisible(true)
        }

        ticking = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = previousOverflow
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const roleLabel = role ? `${role[0]}${role.slice(1).toLowerCase()}` : ""

  return (
    <header
      className={`sticky top-0 z-[200] border-b border-border bg-background/80 backdrop-blur-lg transition-transform duration-500 ease-in-out will-change-transform ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-xl p-2">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LearnQuest
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Search Landing</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form className="px-2 py-1.5 flex items-center gap-2" onSubmit={handleSearchSubmit}>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search courses, videos, books..."
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  />
                  <Button type="submit" size="sm" className="rounded-full">
                    Go
                  </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              className="relative p-2 hover:bg-muted rounded-full transition-colors"
              onClick={onWishlistClick}
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-chart-4 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              className="relative p-2 hover:bg-muted rounded-full transition-colors"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {role === "TEACHER" && unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-chart-4 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-muted-foreground/30 rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role !== "TEACHER" ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No notifications</div>
                ) : notificationLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No notifications</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div key={item.id} className="px-3 py-2 border-b last:border-b-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.fromParent} ({item.guardianRelationship.toLowerCase()}) sent feedback
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Child: {item.childName}
                          {item.subjectName ? ` • Subject: ${item.subjectName}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2 max-w-[280px]">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="truncate">{fullName}</span>
                    {roleLabel && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {roleLabel}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <p className="font-semibold">{fullName}</p>
                    {roleLabel ? <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p> : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {role === "STUDENT" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/student">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  {role === "TEACHER" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/teacher">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  {role === "ADMIN" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/admin">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  {role === "PARENT" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/parent">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" className="rounded-full gap-2" asChild>
                  <Link href="/auth/sign-in">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>

                <Button className="rounded-full" asChild>
                  <Link href="/auth/register">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <button
              className="p-2 hover:bg-muted rounded-xl transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="lg:hidden mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="max-w-[150px] rounded-full border border-border bg-muted/40 px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-muted/70 transition-colors">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate max-w-[72px]">{fullName}</span>
                  {roleLabel ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {roleLabel}
                    </span>
                  ) : null}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{fullName}</p>
                  {roleLabel ? <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p> : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "STUDENT" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/student">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                {role === "TEACHER" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/teacher">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                {role === "ADMIN" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/admin">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                {role === "PARENT" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/parent">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[9999]">
            <button
              aria-label="Close menu backdrop"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute inset-0 w-screen h-screen overflow-y-auto bg-background shadow-2xl">
              <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                <p className="font-semibold text-foreground">Menu</p>
                <button
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-4 flex flex-col gap-4">
                <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search..."
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  />
                  <Button type="submit" size="sm" className="rounded-full" onClick={() => setIsOpen(false)}>
                    Go
                  </Button>
                </form>

                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-muted-foreground hover:text-primary font-medium transition-colors py-2 cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {role === "STUDENT" ? (
                        <Button variant="outline" className="rounded-full w-full" asChild>
                          <Link href="/dashboard/student" onClick={() => setIsOpen(false)}>
                            Dashboard
                          </Link>
                        </Button>
                      ) : null}
                      {role === "TEACHER" ? (
                        <Button variant="outline" className="rounded-full w-full" asChild>
                          <Link href="/dashboard/teacher" onClick={() => setIsOpen(false)}>
                            Dashboard
                          </Link>
                        </Button>
                      ) : null}
                      {role === "ADMIN" ? (
                        <Button variant="outline" className="rounded-full w-full" asChild>
                          <Link href="/dashboard/admin" onClick={() => setIsOpen(false)}>
                            Dashboard
                          </Link>
                        </Button>
                      ) : null}
                      {role === "PARENT" ? (
                        <Button variant="outline" className="rounded-full w-full" asChild>
                          <Link href="/dashboard/parent" onClick={() => setIsOpen(false)}>
                            Dashboard
                          </Link>
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        className="rounded-full w-full"
                        onClick={async () => {
                          setIsOpen(false)
                          await handleSignOut()
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/auth/sign-in" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>

                      <Button className="rounded-full" asChild>
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
