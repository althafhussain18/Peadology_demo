"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/components/cart-context"
import { ArrowLeft, BookOpen, Trash2, ShoppingBag, Heart, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CartViewProps {
  onBack: () => void
  onWishlistClick: () => void
  onCheckout: () => void
}

export function CartView({ onBack, onWishlistClick, onCheckout }: CartViewProps) {
  const { cartItems, wishlistCount, removeFromCart, cartTotal, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  const handleRemoveFromCart = (title: string) => {
    removeFromCart(title)
    toast({
      title: "😢 Removed from Cart",
      description: `"${title}" has been removed from your cart.`,
    })
  }

  const handleMoveToWishlist = (item: typeof cartItems[0]) => {
    if (isInWishlist(item.title)) {
      removeFromWishlist(item.title)
      toast({
        title: "😢 Removed from Wishlist",
        description: `"${item.title}" has been removed from your wishlist.`,
      })
      return
    }
    addToWishlist(item)
    toast({
      title: "😊 Added to Wishlist",
      description: `"${item.title}" has been added to your wishlist.`,
    })
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
                <ShoppingBag className="w-6 h-6 text-primary" />
                Shopping Cart
              </h1>
            </div>
            <Button variant="outline" className="rounded-full gap-2" onClick={onWishlistClick}>
              <Heart className="w-4 h-4" />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div>

              {cartItems.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">Your cart is empty</p>
                    <p className="text-muted-foreground text-sm mb-4">Add some books to get started</p>
                    <Button onClick={onBack} className="rounded-full">
                      Browse Books
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`${item.accentColor || "bg-primary"} w-20 h-24 rounded-lg flex items-center justify-center shrink-0`}>
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground truncate">{item.title}</h3>
                            {item.author && (
                              <p className="text-sm text-muted-foreground">by {item.author}</p>
                            )}
                            {item.grade && (
                              <span className="inline-block mt-1 text-xs bg-muted px-2 py-1 rounded-full">
                                {item.grade}
                              </span>
                            )}
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                isInWishlist(item.title)
                                  ? "text-chart-4"
                                  : "text-muted-foreground hover:text-chart-4"
                              }`}
                              onClick={() => handleMoveToWishlist(item)}
                              title={isInWishlist(item.title) ? "In Wishlist" : "Add to Wishlist"}
                            >
                              {isInWishlist(item.title) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Heart className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveFromCart(item.title)}
                              title="Remove from Cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-accent">Free</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-bold text-lg text-foreground">
                      <span>Total</span>
                      <span className="text-primary">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={onCheckout}
                  className="w-full rounded-full text-lg py-6" 
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
