"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { X } from "lucide-react"

interface MarketingOverlayProps {
    content: {
        title: string
        subtitle: string
        buttonText: string
        link: string
    }
    onClose: () => void
}

export default function MarketingOverlay({ content, onClose }: MarketingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-none w-[110%] max-w-[400px] p-4 sm:p-8 relative mx-auto"
        >
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close overlay"
            >
                <X size={20} className="text-gray-500" />
            </button>

            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[1.5rem] sm:text-[2rem] leading-tight font-medium text-center mb-4"
                style={{ fontFamily: '"Josefin Slab", serif' }}
            >
                {content.title}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center text-gray-500 text-sm sm:text-base mb-6"
            >
                {content.subtitle}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center"
            >
                <Link href={content.link}>
                    <span className="inline-block bg-[#F47B20] hover:bg-[#E06910] text-white px-4 sm:px-6 py-2 text-sm tracking-wider transition-colors duration-200">
                        {content.buttonText}
                    </span>
                </Link>
            </motion.div>
        </motion.div>
    )
}