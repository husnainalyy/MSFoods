"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Leaf, Award, UtensilsCrossed, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the category type
interface ProductCategory {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    bgColor: string
    textColor: string
}

// Define our product categories
const productCategories: ProductCategory[] = [
    {
        id: "pure-natural",
        title: "Pure & Natural",
        description: "Organic spices and dry fruits with no additives or preservatives",
        icon: <Leaf className="w-8 h-8" />,
        bgColor: "bg-green-50",
        textColor: "text-green-600",
    },
    {
        id: "premium-quality",
        title: "Premium Quality",
        description: "Carefully sourced from the finest farms and suppliers worldwide",
        icon: <Award className="w-8 h-8" />,
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
    },
    {
        id: "traditional-recipes",
        title: "Traditional Recipes",
        description: "Perfect ingredients for authentic traditional cooking",
        icon: <UtensilsCrossed className="w-8 h-8" />,
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
    },
    {
        id: "health-benefits",
        title: "Health Benefits",
        description: "Natural ingredients that support your health and wellbeing",
        icon: <Heart className="w-8 h-8" />,
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
    },
]

export default function ShopByCategory() {
    const [currentPage, setCurrentPage] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)

    // Items per page based on screen size
    const itemsPerPage = 2
    const totalPages = Math.ceil(productCategories.length / itemsPerPage)

    // Check if we're on mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkIfMobile()
        window.addEventListener("resize", checkIfMobile)

        return () => {
            window.removeEventListener("resize", checkIfMobile)
        }
    }, [])

    // Handle navigation
    const goToPage = (pageIndex: number) => {
        // Ensure we stay within bounds with proper wrapping
        const newPage = pageIndex < 0 ? totalPages - 1 : pageIndex >= totalPages ? 0 : pageIndex

        setCurrentPage(newPage)
    }

    // Get visible categories based on current page
    const getVisibleCategories = () => {
        const start = currentPage * itemsPerPage
        return productCategories.slice(start, start + itemsPerPage)
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16 bg-white">
            {/* <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Shop By Category</h2>
            <p className="text-gray-700 text-center max-w-2xl mx-auto mb-12">
                Discover our premium selection of spices and dry fruits, carefully curated for your culinary adventures
            </p> */}

            <div className="relative">
                {/* Desktop view - all items visible */}
                <div className="hidden md:grid md:grid-cols-4 gap-8">
                    {productCategories.map((category) => (
                        <div
                            key={category.id}
                            className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-105"
                        >
                            <div
                                className={cn(
                                    "rounded-full w-28 h-28 flex items-center justify-center mb-6 shadow-sm transition-all duration-300",
                                    category.bgColor,
                                    "group-hover:shadow-md",
                                )}
                            >
                                <div className={category.textColor}>{category.icon}</div>
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-3 text-gray-900">{category.title}</h3>
                            <p className="text-center text-gray-600 text-sm px-4">{category.description}</p>
                        </div>
                    ))}
                </div>

                {/* Mobile view - carousel with proper pagination */}
                <div className="md:hidden">
                    <div ref={carouselRef} className="overflow-hidden relative">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={currentPage}
                                className="flex w-full"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.1}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x > 100) {
                                        goToPage(currentPage - 1)
                                    } else if (info.offset.x < -100) {
                                        goToPage(currentPage + 1)
                                    }
                                }}
                            >
                                {getVisibleCategories().map((category) => (
                                    <div key={category.id} className="flex flex-col items-center w-1/2 flex-shrink-0 px-4 cursor-pointer">
                                        <div
                                            className={cn(
                                                "rounded-full w-24 h-24 flex items-center justify-center mb-4 shadow-sm",
                                                category.bgColor,
                                            )}
                                        >
                                            <div className={category.textColor}>{category.icon}</div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-center mb-2 text-gray-900">{category.title}</h3>
                                        <p className="text-center text-gray-600 text-xs">{category.description}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pagination for mobile */}
                    <div className="flex justify-center items-center mt-8 space-x-4">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="flex space-x-2">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToPage(index)}
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-colors",
                                        currentPage === index ? "bg-blue-600" : "bg-gray-300",
                                    )}
                                    aria-label={`Go to page ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

