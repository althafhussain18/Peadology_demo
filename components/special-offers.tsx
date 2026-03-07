"use client"

import { Button } from "@/components/ui/button"
import { Clock, Award } from "lucide-react"
import { offers } from "@/lib/offers-data"

interface SpecialOffersProps {
  onSelectOffer?: (offerId: string) => void
}

export function SpecialOffers({ onSelectOffer }: SpecialOffersProps) {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-chart-4/10 rounded-full px-4 py-2 mb-4">
          <Award className="w-5 h-5 text-chart-4" />
          <span className="text-chart-4 font-semibold">Special Offers</span>
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {"Don't Miss These Deals!"}
        </h2>
        <p className="text-muted-foreground text-lg">Limited time offers for our young learners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer, index) => {
          const Icon = offer.icon
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${offer.bgClass} p-8 md:p-10`}
            >
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

                <h3
                  className="text-2xl md:text-3xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {offer.title}
                </h3>
                <p className="text-white/90 text-lg mb-6">{offer.description}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => onSelectOffer?.(offer.id)}
                  >
                    Claim Offer
                  </Button>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{offer.expires}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
