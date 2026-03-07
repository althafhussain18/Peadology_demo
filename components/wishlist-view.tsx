"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/components/cart-context"
import { ArrowLeft, BookOpen, ShoppingBag, Heart, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WishlistViewProps {
  onBack: () => void
  onCartClick: () => void
}

export function WishlistView({ onBack, onCartClick }: WishlistViewProps) {
  const { wishlistItems, removeFromWishlist, addToCart, isInCart } = useCart()

  const handleRemoveFromWishlist = (title: string) => {
    removeFromWishlist(title)
    toast({
      title: "😢 Removed from Wishlist",
      description: `"${title}" has been removed from your wishlist.`,
    })
  }

  const handleMoveToCart = (item: typeof wishlistItems[0]) => {
    if (isInCart(item.title)) {
      onCartClick()
      return
    }
    removeFromWishlist(item.title)
    addToCart(item)
    toast({
      title: "😊 Moved to Cart",
      description: `"${item.title}" has been moved to your cart.`,
    })
  }

  const handleAddAllToCart = () => {
    let addedCount = 0
    wishlistItems.forEach((item) => {
      if (!isInCart(item.title)) {
        addToCart(item)
        removeFromWishlist(item.title)
        addedCount++
      }
    })
    if (addedCount > 0) {
      toast({
        title: "😊 Added to Cart",
        description: `${addedCount} item${addedCount > 1 ? "s" : ""} moved to your cart.`,
      })
    } else {
      toast({
        title: "Already in Cart",
        description: "All items are already in your cart.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Heart className="w-6 h-6 text-chart-4" />
                My Wishlist
              </h1>
            </div>
            <Button variant="outline" className="rounded-full gap-2" onClick={onCartClick}>
              <ShoppingBag className="w-4 h-4" />
              View Cart
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <Card className="border-dashed max-w-lg mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="w-20 h-20 text-muted-foreground/30 mb-6" />
              <p className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</p>
              <p className="text-muted-foreground text-center mb-6">
                Save items you love by clicking the heart icon on any book
              </p>
              <Button onClick={onBack} className="rounded-full">
                Browse Books
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} in your wishlist
              </p>
              <Button 
                variant="outline" 
                className="rounded-full gap-2"
                onClick={handleAddAllToCart}
              >
                <ShoppingBag className="w-4 h-4" />
                Add All to Cart
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => (
                <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={`${item.accentColor || "bg-chart-4"} h-40 flex items-center justify-center relative`}>
                      <BookOpen className="w-16 h-16 text-white/90" />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background text-chart-4"
                        onClick={() => handleRemoveFromWishlist(item.title)}
                        title="Undo Wishlist"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground line-clamp-2">{item.title}</h3>
                        {item.author && (
                          <p className="text-sm text-muted-foreground mt-1">by {item.author}</p>
                        )}
                      </div>
                      {item.grade && (
                        <span className="inline-block text-xs bg-muted px-2 py-1 rounded-full">
                          {item.grade}
                        </span>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">${item.price.toFixed(2)}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button 
                        className="w-full rounded-full gap-2"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {isInCart(item.title) ? "Go to Cart" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
