"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface CartItem {
  title: string
  price: number
  author?: string
  originalPrice?: number
  accentColor?: string
  grade?: string
}

interface CartContextType {
  cartItems: CartItem[]
  wishlistItems: CartItem[]
  addToCart: (item: CartItem) => void
  addToWishlist: (item: CartItem) => void
  removeFromCart: (title: string) => void
  removeFromWishlist: (title: string) => void
  isInCart: (title: string) => boolean
  isInWishlist: (title: string) => boolean
  cartCount: number
  wishlistCount: number
  cartTotal: number
  onNavigateToCart?: () => void
  setNavigateToCart: (fn: () => void) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([])
  const [onNavigateToCart, setOnNavigateToCart] = useState<(() => void) | undefined>(undefined)

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      if (prev.some((i) => i.title === item.title)) return prev
      return [...prev, item]
    })
  }, [])

  const addToWishlist = useCallback((item: CartItem) => {
    setWishlistItems((prev) => {
      if (prev.some((i) => i.title === item.title)) return prev
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((title: string) => {
    setCartItems((prev) => prev.filter((i) => i.title !== title))
  }, [])

  const removeFromWishlist = useCallback((title: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.title !== title))
  }, [])

  const isInCart = useCallback((title: string) => {
    return cartItems.some((i) => i.title === title)
  }, [cartItems])

  const isInWishlist = useCallback((title: string) => {
    return wishlistItems.some((i) => i.title === title)
  }, [wishlistItems])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0)

  const setNavigateToCart = useCallback((fn: () => void) => {
    setOnNavigateToCart(() => fn)
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        addToWishlist,
        removeFromCart,
        removeFromWishlist,
        isInCart,
        isInWishlist,
        cartCount: cartItems.length,
        wishlistCount: wishlistItems.length,
        cartTotal,
        onNavigateToCart,
        setNavigateToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
