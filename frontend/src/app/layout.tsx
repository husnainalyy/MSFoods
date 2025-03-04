import type { Metadata } from "next"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Header from "./Component/Header"
import type React from "react"
import { UserProvider } from "./Component/UserContext"
import { CartProvider } from "./Component/CartContext"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "peach flask",
    description: "Peach flask ecomerce store",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <UserProvider>
                    <CartProvider>
                        <Header />
                        {children}
                        <Toaster />
                    </CartProvider>
                </UserProvider>
            </body>
        </html>
    )
}

