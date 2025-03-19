"use client"

import Link from "next/link"
import { LayoutDashboard, Box, TicketPercent, Star, List, ShoppingCart, LineChart } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function AdminSidebar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path
    }

    const links = [
        {
            href: "/admin/products",
            icon: Box,
            label: "Products",
        },
        {
            href: "/admin/coupons",
            icon: TicketPercent,
            label: "Coupons",
        },
        {
            href: "/admin/reviews",
            icon: Star,
            label: "Reviews",
        },
        {
            href: "/admin/categories",
            icon: List,
            label: "Categories",
        },
        {
            href: "/admin/orders",
            icon: ShoppingCart,
            label: "Orders",
        },
        {
            href: "/admin/sales",
            icon: LineChart,
            label: "Sales Analytics",
        },
         {
            href: "/admin/users",
            icon: LineChart,
            label: "Users Management",
        },
    ]

    return (
        <Sidebar className="bg-white">
            <SidebarHeader className="border-b p-4">
               
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <nav className="space-y-1 p-2">
                    {links.map((link) => {
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href} 
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(link.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </SidebarContent>
        </Sidebar>
    )
}

