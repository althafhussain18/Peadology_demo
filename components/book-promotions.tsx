"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, ShoppingCart, Sparkles, Heart, Check } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { toast } from "@/hooks/use-toast"

interface BookPromotionsProps {
  onSelectBook?: (bookId: string) => void
  onBrowseAllBooks?: () => void
  onGoToCart?: () => void
  showBrowseAllButton?: boolean
  showAllBooks?: boolean
}

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
  },
]

export function BookPromotions({
  onSelectBook,
  onBrowseAllBooks,
  onGoToCart,
  showBrowseAllButton = true,
  showAllBooks = false,
}: BookPromotionsProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart()
  const visibleBooks = showAllBooks ? books : books.slice(0, 4)

  const handleAddToCart = (book: typeof books[0]) => {
    if (isInCart(book.title)) {
      onGoToCart?.()
      return
    }
    addToCart({ title: book.title, price: book.price, author: book.author, originalPrice: book.originalPrice, accentColor: book.accentColor, grade: book.grade })
    toast({
      title: "😊 Added to Cart",
      description: `"${book.title}" has been added to your cart.`,
    })
  }

  const handleAddToWishlist = (book: typeof books[0]) => {
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

  return (
    <section id="books" className="py-12 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-secondary" />
            <span className="text-secondary font-semibold">New Arrivals</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Books Your Kids Will Love
          </h2>
          <p className="text-muted-foreground text-lg">Explore our collection of educational books</p>
        </div>
        {showBrowseAllButton && (
          <Button variant="outline" className="mt-4 md:mt-0 rounded-full" onClick={onBrowseAllBooks}>
            Browse All Books
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleBooks.map((book, index) => (
          <Card
            key={index}
            className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/10"
            onClick={() => onSelectBook?.(book.id)}
          >
            <div className={`relative h-48 bg-gradient-to-br ${book.color} flex items-center justify-center`}>
              {book.isNew && (
                <div className="absolute top-3 left-3 bg-chart-4 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
              )}

              <div className={`${book.accentColor} w-24 h-32 rounded-lg shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300`}>
                <BookOpen className="w-10 h-10 text-white" />
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-foreground text-sm font-medium px-4 py-1.5 rounded-full shadow-md">
                {book.grade}
              </div>
            </div>

            <CardContent className="p-5 pt-6">
              <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>

              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="font-medium text-foreground">{book.rating}</span>
                <span className="text-muted-foreground text-sm">({book.reviews} reviews)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">${book.price}</span>
                  <span className="text-sm text-muted-foreground line-through">${book.originalPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isInWishlist(book.title) ? "default" : "outline"}
                    className={`rounded-full h-10 w-10 p-0 ${isInWishlist(book.title) ? "bg-chart-4 hover:bg-chart-4/90" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToWishlist(book)
                    }}
                  >
                    {isInWishlist(book.title) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className={`rounded-full h-10 w-10 p-0 ${isInCart(book.title) ? "bg-accent hover:bg-accent/90" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(book)
                    }}
                  >
                    {isInCart(book.title) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
