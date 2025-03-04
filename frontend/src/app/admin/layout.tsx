import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RequireAuth } from "../Component/require-auth"
import AdminSidebar from "../Component/AdminSidebar"
import AdminTopBar from "../Component/AdminTopBar"


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RequireAuth>
            <SidebarProvider>
                <div className="flex min-h-screen  w-full">
                    <AdminSidebar />
                    <div className=" flex flex-col w-full max-w-8xl border overflow-auto">
                        <AdminTopBar />
                        <main className="flex-1 p-4 md:p-6 bg-gray-50/50 overflow-auto">{children}</main>
                    </div>
                </div>
            </SidebarProvider>
        </RequireAuth>
    )
}

