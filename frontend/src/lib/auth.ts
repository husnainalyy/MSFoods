import { jwtDecode } from "jwt-decode"
import { toast } from "@/components/ui/use-toast"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface DecodedToken {
    exp: number
    id: string
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export async function login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    })

    if (!response.ok) {
        const error = await response.json()
        toast({
            title: "Error",
            description: "Login failed" + error.message,
            variant: "destructive",
        })
    }

    const data = await response.json()
    localStorage.setItem("user", JSON.stringify(data.data))
    return data.data
}

export function logout() {
    localStorage.removeItem("user")
    // You may want to call your backend logout endpoint here
    // to invalidate the refresh token
}

export function getUser(): User | null {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

export function isAuthenticated(): boolean {
    const user = getUser()
    return !!user
}

export function isAdmin(): boolean {
    const user = getUser()
    return user?.role === "admin"
}

export async function refreshAccessToken(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
    })

    if (!response.ok) {
        toast({
            title: "Error",
            description: "Failed to refresh token",
            variant: "destructive",
        })
    }

    // The new access token is automatically set in the cookie by the backend
}

export function isTokenExpired(): boolean {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1")
    if (!token) return true

    const decodedToken = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
}

