import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "./Component/Header";
import type React from "react";
import { UserProvider } from "./Component/user-context";
import { CartProvider } from "./Component/CartContext";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
    title: "Peach Flask",
    description: "Peach Flask eCommerce store",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={dmSans.className}>
                <UserProvider>
                    <CartProvider>
                        {children}
                        <Toaster />
                    </CartProvider>
                </UserProvider>
            </body>
        </html>
    );
}
