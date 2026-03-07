import { Gift, Zap, LucideIcon } from "lucide-react"

export type Offer = {
  id: string
  title: string
  description: string
  discount: string
  icon: LucideIcon
  bgClass: string
  expires: string
  details: string
}

export const offers: Offer[] = [
  {
    id: "back-to-school-bundle",
    title: "Back to School Bundle",
    description: "Get all subjects at 50% off when you subscribe yearly",
    discount: "50% OFF",
    icon: Gift,
    bgClass: "from-primary to-primary/80",
    expires: "Ends in 3 days",
    details:
      "Unlock full access to mathematics, science, english, social studies, art, and music with one yearly plan at a 50% discounted rate.",
  },
  {
    id: "early-bird-special",
    title: "Early Bird Special",
    description: "First month free for new students joining today",
    discount: "FREE",
    icon: Zap,
    bgClass: "from-accent to-accent/80",
    expires: "Limited time",
    details:
      "New learners can start with a free first month. Explore video lessons, courses, and practice activities before your paid plan starts.",
  },
]
