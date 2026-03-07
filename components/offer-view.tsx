"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Sparkles } from "lucide-react"
import { offers } from "@/lib/offers-data"

interface OfferViewProps {
  offerId: string
  onBack: () => void
}

export function OfferView({ offerId, onBack }: OfferViewProps) {
  const offer = offers.find((o) => o.id === offerId)

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Offer not found</h1>
          <Button onClick={onBack}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const Icon = offer.icon

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${offer.bgClass} p-8 md:p-10`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="bg-white text-primary font-bold text-xl px-4 py-2 rounded-full shadow-lg">
                {offer.discount}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {offer.title}
            </h1>
            <p className="text-white/90 text-lg mb-4">{offer.description}</p>
            <p className="text-white/90 mb-6">{offer.details}</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Offer Claimed
              </Button>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{offer.expires}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
