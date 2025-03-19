import Image from "next/image"

interface ImageSliderProps {
    images: string[]
    currentIndex: number
}

export default function ImageSlider({ images, currentIndex }: ImageSliderProps) {
    return (
        <div className="relative w-full h-full">
            <Image
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`Slide ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
            />
        </div>
    )
}

