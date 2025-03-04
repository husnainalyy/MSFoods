"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type React from "react" // Added import for React
import { useUser } from "./UserContext"

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user } = useUser()

    useEffect(() => {
        if (!user) {
            router.push("/auth/login")
        } else if (user.role !== "admin") {
            router.push("/")
        }
    }, [user, router])

    if (!user || user.role !== "admin") {
        return null
    }

    return <>{children}</>
}

