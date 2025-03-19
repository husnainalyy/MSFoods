"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

export default function AdminTopBar() {
    const [stats, setStats] = useState<{
        totalProducts: number
        totalSales: number
        totalCategories: number
    } | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            // Simulated API call
            const data = await fetch(`${API_URL}/api/settings/stats`).then((res) => res.json())
            console.log(data)
            setStats(data)
        }

        fetchStats()
    }, [])

    return (
        <div className="border-b p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-4">
                <SidebarTrigger>
                    <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="text-xl font-bold hidden sm:block">Admin Dashboard</h1>
            </div>

            <div className="flex gap-2 sm:gap-4 overflow-auto">
                {stats ? (
                    <>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground  sm:inline">Products:</span>
                            <Badge variant="outline">{stats.totalProducts}</Badge>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground  sm:inline">Sales:</span>
                            <Badge variant="outline">${stats.totalSales}</Badge>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground  sm:inline">Categories:</span>
                            <Badge variant="outline">{stats.totalCategories}</Badge>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                )}
            </div>
        </div>
    )
}

