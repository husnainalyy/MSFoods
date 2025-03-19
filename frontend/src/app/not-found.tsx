"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import Link from "next/link"
import { ShoppingCart} from "lucide-react"
import type React from "react" // Added import for React

const TypingText = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState("")

    useEffect(() => {
        let i = 0
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText((prev) => prev + text.charAt(i))
                i++
            } else {
                clearInterval(typingInterval)
            }
        }, 100)

        return () => clearInterval(typingInterval)
    }, [text])

    return <span>{displayText}</span>
}



export default function NotFound() {
    const cartControls = useAnimation()

    useEffect(() => {
        cartControls.start({
            x: ["0%", "100%"],
            transition: { duration: 5, ease: "linear", repeat: Number.POSITIVE_INFINITY },
        })
    }, [cartControls])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            <motion.h1
                className="text-4xl md:text-6xl font-bold text-blue-600 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <TypingText text="Oops! Page Not Found" />
            </motion.h1>

            <motion.p
                className="text-xl text-gray-600 mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
            >
                Looks like this product is not found in our digital shelves!
            </motion.p>

            <motion.div className="text-blue-500" animate={cartControls}>
                <ShoppingCart size={48} />
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
                <Link
                    href="/"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    Return to Home
                </Link>
            </motion.div>

        </div>
    )
}

