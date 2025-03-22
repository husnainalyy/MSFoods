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
    stock: number
    priceOptionId: string
    weight: number
    weightType: string
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (itemId: string, priceOptionId: string) => void
    updateQuantity: (itemId: string, priceOptionId: string, quantity: number) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([])

    useEffect(() => {
        const cartData = Cookies.get("cart")
        if (cartData) {
            try {
                setCart(JSON.parse(cartData))
            } catch (error) {
                console.error("Failed to parse cart data from cookies:", error)
                setCart([])
            }
        }
    }, [])

    const updateCart = (newCart: CartItem[]) => {
        setCart(newCart)
        Cookies.set("cart", JSON.stringify(newCart), { expires: 7 })
    }

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (cartItem) => cartItem.id === item.id && cartItem.priceOptionId === item.priceOptionId
            )

            if (existingItemIndex > -1) {
                const existingItem = prevCart[existingItemIndex]
                const newQuantity = existingItem.quantity + item.quantity

                // Check if adding more would exceed stock
                if (newQuantity > item.stock) {
                    // If exceeding stock, set to maximum available
                    const newCart = [...prevCart]
                    newCart[existingItemIndex] = {
                        ...existingItem,
                        quantity: item.stock,
                    }
                    updateCart(newCart)
                    return newCart
                }

                const newCart = [...prevCart]
                newCart[existingItemIndex] = {
                    ...existingItem,
                    quantity: newQuantity,
                }
                updateCart(newCart)
                return newCart
            } else {
                // For new items, add with specified quantity and include all details
                const newCart = [...prevCart, { ...item }]
                updateCart(newCart)
                return newCart
            }
        })
    }

    const removeFromCart = (itemId: string, priceOptionId: string) => {
        setCart((prevCart) => {
            const newCart = prevCart.filter(
                (item) => !(item.id === itemId && item.priceOptionId === priceOptionId)
            )
            updateCart(newCart)
            return newCart
        })
    }

    const updateQuantity = (itemId: string, priceOptionId: string, quantity: number) => {
        setCart((prevCart) => {
            const newCart = prevCart.map((item) => {
                if (item.id === itemId && item.priceOptionId === priceOptionId) {
                    // Ensure quantity doesn't exceed stock and is at least 1
                    const safeQuantity = Math.min(Math.max(1, quantity), item.stock)
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

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice
            }}
        >
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
