"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

interface User {
    _id: string
    name: string
    email?: string
    phone?: string
    role: string
    accessToken?: string
}

interface UserContextType {
    user: User | null
    isAuthenticated: boolean
    login: (user: User, tokens?: { accessToken: string; refreshToken: string }) => void
    logout: () => void
    loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // First check localStorage
                const storedUser = localStorage.getItem("user")
                const accessToken = localStorage.getItem("accessToken")

                if (storedUser && accessToken) {
                    setUser(JSON.parse(storedUser))
                } else {
                    // If not in localStorage, check cookies
                    const cookieToken = Cookies.get("accessToken")
                    if (cookieToken) {
                        // Fetch user data using the token
                        const response = await fetch(`${API_URL}/api/auth/me`, {
                            headers: {
                                Authorization: `Bearer ${cookieToken}`,
                            },
                            credentials: "include",
                        })

                        if (response.ok) {
                            const data = await response.json()
                            setUser(data.data)
                            localStorage.setItem("user", JSON.stringify(data.data))
                            localStorage.setItem("accessToken", cookieToken)
                        }
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Login failed")
            }

            // Store user data and tokens
            localStorage.setItem("user", JSON.stringify(data.data.user))
            localStorage.setItem("accessToken", data.data.accessToken)
            localStorage.setItem("refreshToken", data.data.refreshToken)

            // Also set cookies as backup
            Cookies.set("accessToken", data.data.accessToken, { expires: 7 })

            setUser(data.data.user)

            toast({
                title: "Login successful",
                description: "Welcome back!",
            })

            router.push("/")
        } catch (error) {
            toast({
                title: "Login failed",
                description: error instanceof Error ? error.message : "An error occurred during login",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const register = async (name: string, email: string, password: string, phone?: string) => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, phone }),
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Registration failed")
            }

            // Store user data and tokens
            localStorage.setItem("user", JSON.stringify(data.data.user))
            localStorage.setItem("accessToken", data.data.accessToken)
            localStorage.setItem("refreshToken", data.data.refreshToken)

            // Also set cookies as backup
            Cookies.set("accessToken", data.data.accessToken, { expires: 7 })

            setUser(data.data.user)

            toast({
                title: "Registration successful",
                description: "Your account has been created!",
            })

            router.push("/")
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "An error occurred during registration",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Clear cookies
        Cookies.remove("accessToken")

        setUser(null)

        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
        })

        router.push("/")
    }

    const loginUpdated = (user: User, tokens?: { accessToken: string; refreshToken: string }) => {
        setUser(user)
        if (tokens) {
            localStorage.setItem("accessToken", tokens.accessToken)
            localStorage.setItem("refreshToken", tokens.refreshToken)
            Cookies.set("accessToken", tokens.accessToken, { expires: 7 })
        }
    }

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user && !!localStorage.getItem("accessToken"),
                login: loginUpdated,
                register,
                logout,
                loading,
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

