"use client"

import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/components/cart-context"
import { toast } from "@/hooks/use-toast"

interface PaymentViewProps {
  onBack: () => void
  onSuccess: () => void
}

export function PaymentView({ onBack, onSuccess }: PaymentViewProps) {
  const { cartItems, cartTotal } = useCart()

  const handlePayNow = () => {
    toast({
      title: "✅ Payment successful",
      description: "Your order has been placed successfully.",
    })
    onSuccess()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <CreditCard className="w-7 h-7 text-primary" />
              Payment
            </h1>
            <p className="text-muted-foreground mt-1">Review your order and complete payment.</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Order Items</h2>
              {cartItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">No items in cart.</p>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.title} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate pr-4">{item.title}</span>
                      <span className="font-semibold text-primary">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
              </div>

              <Button className="w-full rounded-full text-lg py-6" disabled={cartItems.length === 0} onClick={handlePayNow}>
                Pay Now
              </Button>

              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Secure payment
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
