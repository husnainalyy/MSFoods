import type { Metadata } from "next"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Header from "./Component/Header"
import type React from "react"
import { UserProvider } from "./Component/user-context"
import { CartProvider } from "./Component/CartContext"
import { Instrument_Sans } from 'next/font/google'



const instrument = Instrument_Sans({ subsets: ['latin'] })


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
            <body  className={instrument.className}>
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

