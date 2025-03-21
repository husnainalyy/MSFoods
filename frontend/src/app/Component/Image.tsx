
"use client"

import Image from "next/image"
import { useMobile } from "@/hooks/use-mobilee"



export default function ReviewsSection() {
  const isMobile = useMobile()

  return (
    <div className="relative w-full h-[300px] md:h-[500px]">
        {/* Mobile Image */}
        <div className="block md:hidden w-full h-full">
          <Image
            src="/SWITCH-2.avif"
            alt="Reviews hero mobile"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Desktop Image */}
        <div className="hidden md:block w-full h-full">
          <Image
            src="/SWITCH.webp"
            alt="Reviews hero desktop"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
  )
}

