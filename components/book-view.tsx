"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Star, ShoppingCart, Heart, Check, Share2, Eye } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { toast } from "@/hooks/use-toast"

const books = [
  {
    id: "fun-with-numbers",
    title: "Fun with Numbers",
    author: "Dr. Sarah Chen",
    grade: "Grade 1-3",
    price: 12.99,
    originalPrice: 19.99,
    rating: 4.9,
    reviews: 234,
    color: "from-chart-1/20 to-chart-1/5",
    accentColor: "bg-chart-1",
    isNew: true,
    description: "Make math fun and exciting with this colorful workbook! Packed with puzzles, games, and activities that help young learners develop a love for numbers.",
    pages: 120,
    chapters: ["Counting Fun", "Addition Adventures", "Subtraction Stories", "Shape Safari", "Number Patterns"],
    features: ["Full-color illustrations", "Practice exercises", "Fun puzzles", "Answer key included"]
  },
  {
    id: "science-adventures",
    title: "Science Adventures",
    author: "Prof. James Wilson",
    grade: "Grade 2-4",
    price: 14.99,
    originalPrice: 22.99,
    rating: 4.8,
    reviews: 189,
    color: "from-accent/20 to-accent/5",
    accentColor: "bg-accent",
    isNew: true,
    description: "Explore the wonders of science through hands-on experiments and fascinating facts! This book brings science to life with easy-to-follow activities.",
    pages: 156,
    chapters: ["Living Things", "Matter & Materials", "Forces & Motion", "Earth & Space", "Amazing Experiments"],
    features: ["50+ experiments", "Safety tips included", "Glossary of terms", "Parent guide"]
  },
  {
    id: "grammar-made-easy",
    title: "Grammar Made Easy",
    author: "Emma Thompson",
    grade: "Grade 3-5",
    price: 11.99,
    originalPrice: 17.99,
    rating: 4.7,
    reviews: 312,
    color: "from-chart-4/20 to-chart-4/5",
    accentColor: "bg-chart-4",
    isNew: false,
    description: "Master grammar with confidence! This comprehensive guide breaks down complex grammar rules into simple, easy-to-understand lessons with plenty of practice.",
    pages: 180,
    chapters: ["Parts of Speech", "Sentence Structure", "Punctuation Power", "Tenses Made Simple", "Writing Better"],
    features: ["Clear explanations", "Practice worksheets", "Writing prompts", "Progress tracking"]
  },
  {
    id: "world-history-kids",
    title: "World History for Kids",
    author: "Michael Roberts",
    grade: "Grade 4-6",
    price: 15.99,
    originalPrice: 24.99,
    rating: 4.9,
    reviews: 156,
    color: "from-secondary/20 to-secondary/5",
    accentColor: "bg-secondary",
    isNew: true,
    description: "Travel through time and discover the amazing stories of our world! From ancient civilizations to modern times, history has never been this exciting.",
    pages: 200,
    chapters: ["Ancient Egypt", "Greek & Roman Era", "Medieval Times", "Age of Exploration", "Modern World"],
    features: ["Timeline included", "Maps & illustrations", "Quiz sections", "Fascinating facts"]
  },
  {
    id: "creative-writing-club",
    title: "Creative Writing Club",
    author: "Lina Patel",
    grade: "Grade 4-6",
    price: 13.49,
    originalPrice: 20.99,
    rating: 4.8,
    reviews: 201,
    color: "from-primary/20 to-primary/5",
    accentColor: "bg-primary",
    isNew: true,
    description: "Write better stories, poems, and short essays with creative prompts and step-by-step activities designed for young writers.",
    pages: 168,
    chapters: ["Idea Generation", "Characters & Setting", "Strong Openings", "Story Endings", "Editing Tips"],
    features: ["Weekly prompts", "Vocabulary booster", "Peer review guide", "Sample stories"]
  },
  {
    id: "coding-for-kids",
    title: "Coding for Kids",
    author: "Noah Martinez",
    grade: "Grade 5-7",
    price: 16.99,
    originalPrice: 25.99,
    rating: 4.9,
    reviews: 278,
    color: "from-chart-2/20 to-chart-2/5",
    accentColor: "bg-chart-2",
    isNew: true,
    description: "A beginner-friendly coding workbook that introduces logic, algorithms, and simple projects kids can build at home.",
    pages: 210,
    chapters: ["What Is Coding?", "Logic Puzzles", "Loops & Conditions", "Mini Projects", "Debugging Basics"],
    features: ["Hands-on projects", "Visual examples", "Challenge sections", "Parent support notes"]
  },
  {
    id: "art-and-craft-lab",
    title: "Art and Craft Lab",
    author: "Sophia Kim",
    grade: "Grade 2-5",
    price: 10.99,
    originalPrice: 16.99,
    rating: 4.7,
    reviews: 145,
    color: "from-chart-3/20 to-chart-3/5",
    accentColor: "bg-chart-3",
    isNew: false,
    description: "A colorful activity book full of drawing, painting, and craft ideas that build creativity and fine motor skills.",
    pages: 132,
    chapters: ["Color Basics", "Paper Crafts", "DIY Decorations", "Nature Art", "Project Gallery"],
    features: ["Step-by-step visuals", "Material checklist", "Easy difficulty levels", "Bonus templates"]
  },
  {
    id: "mental-math-challenges",
    title: "Mental Math Challenges",
    author: "Arjun Mehta",
    grade: "Grade 3-6",
    price: 12.49,
    originalPrice: 18.49,
    rating: 4.8,
    reviews: 188,
    color: "from-chart-1/25 to-chart-1/5",
    accentColor: "bg-chart-1",
    isNew: true,
    description: "Boost speed and confidence in arithmetic with timed practice sets, shortcuts, and game-style challenges.",
    pages: 154,
    chapters: ["Addition Speed", "Multiplication Tricks", "Division Patterns", "Word Problems", "Challenge Rounds"],
    features: ["Timed drills", "Progress tracker", "Strategy tips", "Answer explanations"]
  },
]

interface BookViewProps {
  bookId: string
  onBack: () => void
  onSelectBook: (bookId: string) => void
  onGoToCart: () => void
}

export function BookView({ bookId, onBack, onSelectBook, onGoToCart }: BookViewProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart()
  const book = books.find(b => b.id === bookId)
  const elapsedSecondsRef = useRef(0)
  const sentMinutesRef = useRef(0)
  const openedSentRef = useRef(false)

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Book not found</h1>
          <Button onClick={onBack}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const trackBook = async () => {
    const totalMinutes = Math.floor(elapsedSecondsRef.current / 60)
    const minutesSpent = Math.max(0, totalMinutes - sentMinutesRef.current)

    if (minutesSpent === 0 && openedSentRef.current) {
      return
    }

    await fetch("/api/student/activity/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: book.id,
        title: book.title,
        subject: "General",
        minutesSpent,
      }),
      keepalive: true,
    })

    if (minutesSpent > 0) {
      sentMinutesRef.current += minutesSpent
    } else {
      openedSentRef.current = true
    }
  }

  useEffect(() => {
    elapsedSecondsRef.current = 0
    sentMinutesRef.current = 0
    openedSentRef.current = false

    void trackBook()

    const timer = window.setInterval(() => {
      elapsedSecondsRef.current += 30
      void trackBook()
    }, 30000)

    return () => {
      window.clearInterval(timer)
      void trackBook()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const handleAddToCart = () => {
    if (isInCart(book.title)) {
      onGoToCart()
      return
    }
    addToCart({ title: book.title, price: book.price, author: book.author, originalPrice: book.originalPrice, accentColor: book.accentColor, grade: book.grade })
    toast({
      title: "😊 Added to Cart",
      description: `"${book.title}" has been added to your cart.`,
    })
  }

  const handleAddToWishlist = () => {
    if (isInWishlist(book.title)) {
      removeFromWishlist(book.title)
      toast({
        title: "😢 Removed from Wishlist",
        description: `"${book.title}" has been removed from your wishlist.`,
      })
      return
    }
    addToWishlist({ title: book.title, price: book.price, author: book.author, originalPrice: book.originalPrice, accentColor: book.accentColor, grade: book.grade })
    toast({
      title: "😊 Added to Wishlist",
      description: `"${book.title}" has been added to your wishlist.`,
    })
  }

  const discount = Math.round((1 - book.price / book.originalPrice) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <span className="text-sm text-muted-foreground">{book.grade}</span>
              <h1 className="text-xl font-bold text-foreground">{book.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Cover & Purchase */}
          <div className="space-y-6">
            {/* Book Cover */}
            <div className={`relative aspect-[3/4] rounded-2xl bg-gradient-to-br ${book.color} flex items-center justify-center p-8`}>
              {book.isNew && (
                <div className="absolute top-4 left-4 bg-chart-4 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
              )}
              <div className={`${book.accentColor} w-40 h-52 rounded-lg shadow-2xl flex items-center justify-center`}>
                <BookOpen className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Purchase Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">${book.price}</span>
                  <span className="text-lg text-muted-foreground line-through">${book.originalPrice}</span>
                  <span className="bg-chart-4/10 text-chart-4 text-sm font-medium px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 rounded-full gap-2" 
                    onClick={handleAddToCart}
                  >
                    {isInCart(book.title) ? (
                      <>
                        <Check className="w-4 h-4" />
                        Go to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`rounded-full ${isInWishlist(book.title) ? "bg-chart-4 text-white hover:bg-chart-4/90" : ""}`}
                    onClick={handleAddToWishlist}
                  >
                    {isInWishlist(book.title) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Author */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {book.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">by {book.author}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="font-medium text-foreground">{book.rating}</span>
                  <span className="text-muted-foreground">({book.reviews} reviews)</span>
                </div>
                <span className="bg-muted px-3 py-1 rounded-full">{book.grade}</span>
                <span className="text-muted-foreground">{book.pages} pages</span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-3">About This Book</h3>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Chapters</h3>
                <div className="space-y-3">
                  {book.chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <span className={`w-8 h-8 ${book.accentColor} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
                        {index + 1}
                      </span>
                      <span className="text-foreground">{chapter}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">Features</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {book.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${book.accentColor.replace('bg-', 'text-')}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Books */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4">You May Also Like</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {books.filter(b => b.id !== bookId).slice(0, 2).map((relatedBook, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectBook(relatedBook.id)}
                      className="w-full flex gap-3 text-left rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <div className={`w-16 h-20 rounded-lg ${relatedBook.accentColor} flex items-center justify-center shrink-0`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">{relatedBook.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{relatedBook.author}</p>
                        <span className="text-sm font-bold text-primary">${relatedBook.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
