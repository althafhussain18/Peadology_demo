"use client"

import { useState, useCallback, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { HeroBanner } from "@/components/hero-banner"
import { SubjectCards } from "@/components/subject-cards"
import { VideoLessons } from "@/components/video-lessons"
import { BookPromotions } from "@/components/book-promotions"
import { SpecialOffers } from "@/components/special-offers"
import { Footer } from "@/components/footer"
import { CourseView } from "@/components/course-view"
import { LessonView } from "@/components/lesson-view"
import { CartProvider } from "@/components/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { CartView } from "@/components/cart-view"
import { WishlistView } from "@/components/wishlist-view"
import { VideoView } from "@/components/video-view"
import { BookView } from "@/components/book-view"
import { OfferView } from "@/components/offer-view"
import { PaymentView } from "@/components/payment-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type View = 
  | { type: "home" }
  | { type: "course"; courseId: string }
  | { type: "lesson"; courseId: string; lessonId: string }
  | { type: "cart" }
  | { type: "payment" }
  | { type: "wishlist" }
  | { type: "videos" }
  | { type: "books" }
  | { type: "video"; videoId: string }
  | { type: "book"; bookId: string }
  | { type: "offer"; offerId: string }

export function AppShell() {
  const [view, setView] = useState<View>({ type: "home" })
  const savedScrollPosition = useRef<number>(0)

  const goHome = useCallback((restoreScroll = false) => {
    setView({ type: "home" })
    if (restoreScroll) {
      setTimeout(() => {
        window.scrollTo({ top: savedScrollPosition.current, behavior: "instant" })
      }, 0)
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [])

  const goToCourse = useCallback((courseId: string) => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "course", courseId })
    window.scrollTo({ top: 0 })
  }, [])

  const goToLesson = useCallback((courseId: string, lessonId: string) => {
    if (view.type === "home") {
      savedScrollPosition.current = window.scrollY
    }
    setView({ type: "lesson", courseId, lessonId })
    window.scrollTo({ top: 0 })
  }, [view.type])

  const goToCart = useCallback(() => {
    if (view.type === "home") {
      savedScrollPosition.current = window.scrollY
    }
    setView({ type: "cart" })
    window.scrollTo({ top: 0 })
  }, [view.type])

  const goToWishlist = useCallback(() => {
    if (view.type === "home") {
      savedScrollPosition.current = window.scrollY
    }
    setView({ type: "wishlist" })
    window.scrollTo({ top: 0 })
  }, [view.type])

  const goToPayment = useCallback(() => {
    setView({ type: "payment" })
    window.scrollTo({ top: 0 })
  }, [])

  const goToVideo = useCallback((videoId: string) => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "video", videoId })
    window.scrollTo({ top: 0 })
  }, [])

  const goToVideos = useCallback(() => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "videos" })
    window.scrollTo({ top: 0 })
  }, [])

  const goToBook = useCallback((bookId: string) => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "book", bookId })
    window.scrollTo({ top: 0 })
  }, [])

  const goToBooks = useCallback(() => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "books" })
    window.scrollTo({ top: 0 })
  }, [])

  const goToOffer = useCallback((offerId: string) => {
    savedScrollPosition.current = window.scrollY
    setView({ type: "offer", offerId })
    window.scrollTo({ top: 0 })
  }, [])

  if (view.type === "cart") {
    return (
      <CartProvider>
        <CartView onBack={() => goHome(true)} onWishlistClick={goToWishlist} onCheckout={goToPayment} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "payment") {
    return (
      <CartProvider>
        <PaymentView onBack={goToCart} onSuccess={() => goHome(true)} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "wishlist") {
    return (
      <CartProvider>
        <WishlistView onBack={() => goHome(true)} onCartClick={goToCart} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "video") {
    return (
      <CartProvider>
        <VideoView videoId={view.videoId} onBack={() => goHome(true)} onSelectVideo={goToVideo} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "videos") {
    return (
      <CartProvider>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <Button variant="ghost" onClick={() => goHome(true)} className="rounded-full gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Button>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <VideoLessons onSelectVideo={goToVideo} showViewAllButton={false} showAllVideos enableSearch />
          </main>
        </div>
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "book") {
    return (
      <CartProvider>
        <BookView bookId={view.bookId} onBack={() => goHome(true)} onSelectBook={goToBook} onGoToCart={goToCart} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "books") {
    return (
      <CartProvider>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <Button variant="ghost" onClick={() => goHome(true)} className="rounded-full gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Button>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <BookPromotions onSelectBook={goToBook} onGoToCart={goToCart} showBrowseAllButton={false} showAllBooks />
          </main>
        </div>
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "offer") {
    return (
      <CartProvider>
        <OfferView offerId={view.offerId} onBack={() => goHome(true)} />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "lesson") {
    return (
      <CartProvider>
        <LessonView
          courseId={view.courseId}
          lessonId={view.lessonId}
          onBack={() => goHome(true)}
          onSelectLesson={(lessonId) => goToLesson(view.courseId, lessonId)}
          onBackToCourse={() => goToCourse(view.courseId)}
        />
        <Toaster />
      </CartProvider>
    )
  }

  if (view.type === "course") {
    return (
      <CartProvider>
        <CourseView
          courseId={view.courseId}
          onBack={() => goHome(true)}
          onSelectLesson={(lessonId) => goToLesson(view.courseId, lessonId)}
        />
        <Toaster />
      </CartProvider>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Navigation onCartClick={goToCart} onWishlistClick={goToWishlist} />
        <main>
          <HeroBanner />
          <div className="container mx-auto px-4">
            <SubjectCards onSelectCourse={goToCourse} />
            <VideoLessons onSelectVideo={goToVideo} onViewAllVideos={goToVideos} />
            <BookPromotions onSelectBook={goToBook} onBrowseAllBooks={goToBooks} onGoToCart={goToCart} />
            <SpecialOffers onSelectOffer={goToOffer} />
          </div>
        </main>
        <Footer />
      </div>
      <Toaster />
    </CartProvider>
  )
}
