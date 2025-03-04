// app/Component/CartContext.tsx
"use client"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Cookies from "js-cookie"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  stock: number // Add stock to cart items
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const cartData = Cookies.get("cart")
    if (cartData) {
      setCart(JSON.parse(cartData))
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    Cookies.set("cart", JSON.stringify(newCart), { expires: 7 })
  }

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex > -1) {
        const existingItem = prevCart[existingItemIndex]
        const newQuantity = existingItem.quantity + 1

        // Check if adding one more would exceed stock
        if (newQuantity > item.stock) {
          return prevCart // Return unchanged cart if would exceed stock
        }

        const newCart = [...prevCart]
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        }
        updateCart(newCart)
        return newCart
      } else {
        // For new items, add with quantity 1 and include stock
        const newCart = [...prevCart, { ...item, quantity: 1 }]
        updateCart(newCart)
        return newCart
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== itemId)
      updateCart(newCart)
      return newCart
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (item.id === itemId) {
          // Ensure quantity doesn't exceed stock
          const safeQuantity = Math.min(quantity, item.stock)
          return { ...item, quantity: safeQuantity }
        }
        return item
      })
      updateCart(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    Cookies.remove("cart")
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

