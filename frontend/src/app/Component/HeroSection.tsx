"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const images = [
    "/dall1.jpeg",
    "/dall2.jpeg",
    "/dall3.jpeg",
]
const mobileImages = [
    "/mb1.jpg",
    "/mb2.jpg",
    "/mb3.jpg",
]

const animations = [
    {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    },
    {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    },
    {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
    },
]

export default function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentAnimation, setCurrentAnimation] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const currentImages = isMobile ? mobileImages : images

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % currentImages.length)
        setCurrentAnimation((prevAnim) => (prevAnim + 1) % animations.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + currentImages.length) % currentImages.length)
        setCurrentAnimation((prevAnim) => (prevAnim - 1 + animations.length) % animations.length)
    }

    return (
        <div className="relative w-full min-h-[70vh] flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={animations[currentAnimation].initial}
                    animate={animations[currentAnimation].animate}
                    exit={animations[currentAnimation].exit}
                    transition={{ duration: 0.5 }}
                    className="absolute w-full h-full flex justify-center items-center"
                >
                    <ImageSlider images={currentImages} currentIndex={currentIndex} />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                    onClick={prevSlide}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={40} />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition"
                    aria-label="Next slide"
                >
                    <ChevronRight size={40} />
                </button>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {currentImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-200 ${index === currentIndex ? "bg-white" : "bg-transparent"}`}
                    />
                ))}
            </div>
        </div>
    )
}

interface ImageSliderProps {
    images: string[];
    currentIndex: number;
}

function ImageSlider({ images, currentIndex }: ImageSliderProps) {
    return (
        <div className="relative w-full h-full">
            <Image
                src={images[currentIndex]}
                alt="Hero Image"
                layout="fill"
                objectFit="cover"
                priority
            />
        </div>
    )
}
