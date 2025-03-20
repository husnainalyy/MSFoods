"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Flame, Wheat, Leaf, Package } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the lifestyle category type
interface LifestyleCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  bgColor: string
}

// Define our lifestyle categories
const lifestyleCategories: LifestyleCategory[] = [
  {
    id: "keto",
    title: "Keto",
    description: "Keto friendly products to make you feel your best!",
    icon: <Flame className="w-8 h-8 text-black" />,
    bgColor: "bg-[#d8e8d1]",
  },
  {
    id: "gluten-free",
    title: "Gluten Free",
    description: "Celiac approved so that you can enjoy your favourite foods without the worry!",
    icon: <Wheat className="w-8 h-8 text-black" />,
    bgColor: "bg-[#f8d0d0]",
  },
  {
    id: "plant-based",
    title: "Plant Based",
    description: "Whether it's Vegan Mylk or Tofu, we've got it all!",
    icon: <Leaf className="w-8 h-8 text-black" />,
    bgColor: "bg-[#c9e6e8]",
  },
  {
    id: "high-protein",
    title: "High Protein",
    description: "Select from a range of high protein products!",
    icon: <Package className="w-8 h-8 text-black" />,
    bgColor: "bg-[#f8ecc9]",
  },
]

export default function ImprovedLifestyleCategories() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Items per page based on screen size
  const itemsPerPage = 2
  const totalPages = Math.ceil(lifestyleCategories.length / itemsPerPage)

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
    return lifestyleCategories.slice(start, start + itemsPerPage)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#2d2d2d] mb-12">Shop By Lifestyle</h2>

      <div className="relative">
        {/* Desktop view - all items visible */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {lifestyleCategories.map((category) => (
            <div key={category.id} className="flex flex-col items-center">
              <div className={cn("rounded-full w-24 h-24 flex items-center justify-center mb-4", category.bgColor)}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{category.title}</h3>
              <p className="text-center text-gray-600 text-sm">{category.description}</p>
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
                {getVisibleCategories().map((category, index) => (
                  <div key={category.id} className="flex flex-col items-center w-1/2 flex-shrink-0 px-2">
                    <div
                      className={cn("rounded-full w-20 h-20 flex items-center justify-center mb-4", category.bgColor)}
                    >
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">{category.title}</h3>
                    <p className="text-center text-gray-600 text-xs">{category.description}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination for mobile */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button onClick={() => goToPage(currentPage - 1)} className="p-1 rounded-full" aria-label="Previous page">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm">
              {currentPage + 1} / {totalPages}
            </span>

            <button onClick={() => goToPage(currentPage + 1)} className="p-1 rounded-full" aria-label="Next page">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

