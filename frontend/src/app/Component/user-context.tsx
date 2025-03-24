"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import Cookies from "js-cookie"

interface User {
    _id: string
    name: string
    email: string
    phone: string
    avatar?: string
    role: string
    accessToken?: string // Add this field
}

interface UserContextType {
    user: User | null
    login: (user: User, tokens?: { accessToken: string; refreshToken: string }) => void
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Try to get user from localStorage first (for client-side rendering)
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error("Failed to parse stored user:", error)
                localStorage.removeItem("user")
            }
        } else {
            // Fallback to cookies
            const userData = Cookies.get("user")
            if (userData) {
                try {
                    setUser(JSON.parse(userData))
                } catch (error) {
                    console.error("Failed to parse user data from cookies:", error)
                    Cookies.remove("user")
                }
            }
        }
    }, [])

    const login = (user: User, tokens?: { accessToken: string; refreshToken: string }) => {
        // If tokens are provided, add the accessToken to the user object
        if (tokens && tokens.accessToken) {
            user.accessToken = tokens.accessToken
        }

        setUser(user)
        // Store in both localStorage and cookies for better persistence
        localStorage.setItem("user", JSON.stringify(user))
        Cookies.set("user", JSON.stringify(user), { expires: 7 })

        // Store the token separately for API requests
        if (tokens && tokens.accessToken) {
            localStorage.setItem("accessToken", tokens.accessToken)
            Cookies.set("accessToken", tokens.accessToken, { expires: 7 })
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        Cookies.remove("user")
        Cookies.remove("accessToken")
    }

    return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}

