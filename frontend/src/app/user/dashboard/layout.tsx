"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { User, Settings, ShoppingBag, Clock, LogOut, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "../../Component/user-context"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useUser()

  // Update the logout function to match your API expectations
  const handleLogout = async () => {
    try {
      // Call the context logout function to clear local state
      logout()

      // Redirect to login page
      router.push("/login")

      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Still logout on the client side even if API fails
      logout()
      router.push("/login")
    }
  }

  const navItems = [
    {
      name: "Profile",
      href: "/user/dashboard",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Edit Profile",
      href: "/user/dashboard/edit-profile",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "My Orders",
      href: "/user/dashboard/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Order History",
      href: "/user/dashboard/order-history",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Logout",
      href: "#",
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout,
    },
  ]

  const isActive = (path: string) => {
    if (path === "/user/dashboard" && pathname === "/user/dashboard") {
      return true
    }
    return pathname?.startsWith(path) && path !== "/user/dashboard"
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Enhanced Desktop Sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col h-full overflow-y-auto border-r bg-white shadow-sm">
          {/* User Profile Section */}
          <div className="flex flex-col items-center py-6 px-4 border-b">
            <Avatar className="h-20 w-20 mb-3 border-2 border-gray-200">
              <AvatarFallback className="bg-black text-white text-xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-gray-900">{user?.name || "User"}</h3>
              <p className="text-sm text-gray-500 mt-1">{user?.email || ""}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow px-4 py-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dashboard</h3>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) =>
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100"
                  >
                    <span className="text-gray-500 group-hover:text-gray-700">{item.icon}</span>
                    <span className="ml-3">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href) ? "bg-black text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`${isActive(item.href) ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                    >
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.name}</span>
                    {isActive(item.href) && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) =>
            item.onClick ? (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex flex-col items-center py-3 px-2 flex-1 text-gray-500"
              >
                <div className="p-1 rounded-full">{item.icon}</div>
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 flex-1 ${
                  isActive(item.href) ? "text-black" : "text-gray-500"
                }`}
              >
                <div className={`p-1 rounded-full ${isActive(item.href) ? "bg-black text-white" : ""}`}>
                  {item.icon}
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">{children}</div>
      </main>
    </div>
  )
}

