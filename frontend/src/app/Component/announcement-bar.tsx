"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react'

export default function AnnouncementBar() {
    return (
        <div className="bg-[#800020] text-white py-2 px-4 flex justify-between items-center text-sm h-10">
            <div>  </div>
            <div className="flex-1 md:flex-none lg:text-center lg:ml-40">
                <span className="md:hidden">NEW CUSTOMERS SAVE 10% </span>
                <span className="hidden md:inline">NEW CUSTOMERS SAVE 10% WITH THE CODE GET10</span>
            </div>

            <div className="flex items-center gap-4">
                <Link href="#" aria-label="Facebook">
                    <Facebook size={16} className="text-white hover:text-gray-300 transition-colors" />
                </Link>
                <Link href="#" aria-label="Instagram">
                    <Instagram size={16} className="text-white hover:text-gray-300 transition-colors" />
                </Link>
                <Link href="#" aria-label="Youtube">
                    <Youtube size={16} className="text-white hover:text-gray-300 transition-colors" />
                </Link>
                <Link href="#" aria-label="Twitter">
                    <Twitter size={16} className="text-white hover:text-gray-300 transition-colors" />
                </Link>
                <Link href="#" aria-label="Pinterest">
                    <Linkedin size={16} className="text-white hover:text-gray-300 transition-colors" />
                </Link>
            </div>
        </div>
    )
}
