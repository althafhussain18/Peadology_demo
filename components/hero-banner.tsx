"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles, Rocket, Star } from "lucide-react"

const slides = [
  {
    title: "Learn With Fun!",
    subtitle: "Interactive lessons that make learning exciting",
    cta: "Start Learning",
    bgClass: "from-primary/90 via-primary to-primary/80",
    icon: Sparkles,
  },
  {
    title: "Explore New Subjects",
    subtitle: "Discover science, math, and so much more",
    cta: "Explore Now",
    bgClass: "from-accent via-accent/90 to-accent/80",
    icon: Rocket,
  },
  {
    title: "Become a Star Student",
    subtitle: "Track your progress and earn rewards",
    cta: "Get Started",
    bgClass: "from-secondary via-secondary/90 to-secondary/80",
    icon: Star,
  },
]

export function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [current])

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 lg:mx-0">
      <div
        className={`relative bg-gradient-to-r ${slide.bgClass} transition-all duration-500 ease-out`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl animate-bounce" />
        </div>

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-20 lg:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-xl">
              <div
                className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 transition-all duration-500 ${
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                }`}
              >
                <Icon className="w-5 h-5 text-white" />
                <span className="text-white/90 text-sm font-medium">New Lessons Available!</span>
              </div>

              <h1
                className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-all duration-500 ${
                  isAnimating ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {slide.title}
              </h1>

              <p
                className={`text-lg md:text-xl text-white/90 mb-8 transition-all duration-500 delay-100 ${
                  isAnimating ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0"
                }`}
              >
                {slide.subtitle}
              </p>

              <Button
                size="lg"
                className={`bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                }`}
              >
                {slide.cta}
              </Button>
            </div>

            <div
              className={`relative w-48 h-48 md:w-64 md:h-64 transition-all duration-500 ${
                isAnimating ? "opacity-0 scale-90 rotate-12" : "opacity-100 scale-100 rotate-0"
              }`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-4 bg-white/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrev}
          className="absolute z-20 left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <button
          onClick={handleNext}
          className="absolute z-20 right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true)
                  setCurrent(index)
                  setTimeout(() => setIsAnimating(false), 500)
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
