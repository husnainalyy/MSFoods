"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "./user-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: "user" | "admin"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth/login")
        } else if (!isLoading && requiredRole && user?.role !== requiredRole) {
            router.push(user?.role === "admin" ? "/admin/dashboard" : "/")
        }
    }, [user, isLoading, router, requiredRole])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (requiredRole && user.role !== requiredRole) {
        return null
    }

    return <>{children}</>
}

