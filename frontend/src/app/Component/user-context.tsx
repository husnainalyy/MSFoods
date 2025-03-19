"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
    id: string
    name: string
    email?: string
    phone?: string
    role: string
    isVerified: boolean
}

type AuthTokens = {
    accessToken: string
    refreshToken: string
}

type UserContextType = {
    user: User | null
    setUser: (user: User | null) => void
    isLoading: boolean
    setIsLoading: (isLoading: boolean) => void
    login: (user: User, tokens: AuthTokens) => void
    logout: () => void
    refreshAccessToken: () => Promise<string | null>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()

    // Initialize user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error("Failed to parse stored user:", error)
                localStorage.removeItem("user")
            }
        }
        setIsLoading(false)
    }, [])

    const login = (user: User, tokens: AuthTokens) => {
        // Store user and tokens in localStorage
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("accessToken", tokens.accessToken)
        localStorage.setItem("refreshToken", tokens.refreshToken)
        setUser(user)
    }

    const logout = () => {
        // Clear user and tokens from localStorage
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setUser(null)
        router.push("/auth/login")
    }

    const refreshAccessToken = async (): Promise<string | null> => {
        try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (!refreshToken) return null

            const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            })

            if (!response.ok) throw new Error("Failed to refresh token")

            const data = await response.json()
            localStorage.setItem("accessToken", data.data.accessToken)
            localStorage.setItem("refreshToken", data.data.refreshToken)

            return data.data.accessToken
        } catch (error) {
            console.error("Token refresh failed:", error)
            logout() // Force logout if refresh fails
            return null
        }
    }

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                setIsLoading,
                login,
                logout,
                refreshAccessToken,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}

