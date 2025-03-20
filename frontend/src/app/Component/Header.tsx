"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronRight, ChevronDown, ChevronLeft, Clock, Truck, User, ShoppingCart, Search } from "lucide-react"

const Header = () => {
  const texts = [
    "Minimum Order Amount Rs 3,000",
    "Free Shipping on Orders Above Rs 5,000",
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    setIndex((prevIndex) => (prevIndex + 1) % texts.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prevIndex) => (prevIndex - 1 + texts.length) % texts.length);
  };

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuVariants = {
    closed: {
      x: "-100%", // Change from "100%" to "-100%"
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
  };
  

  const navLinks = [
    { name: "Categories", href: "/categories", hasChildren: false },
    { name: "Our story", href: "/our-story" },
    { name: "Suppliers", href: "/suppliers" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faqs" },
  ]

  return (
    <header className="w-full">
      {/* Top announcement bar */}
      <div className="bg-black text-white py-3 px-4 flex items-center justify-between overflow-hidden relative w-full h-10">
      <ChevronLeft className="h-5 w-5 cursor-pointer" onClick={handlePrev} />
      <div className="w-full flex justify-center overflow-hidden relative h-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={index}
            initial={{ x: direction === 1 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: direction === 1 ? "-100%" : "100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-medium absolute w-full flex justify-center items-center"
          >
            {texts[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <ChevronRight className="h-5 w-5 cursor-pointer" onClick={handleNext} />
    </div>

      {/* Main header */}
      <div className="bg-white py-4 px-4 lg:py-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button className="lg:hidden text-black" onClick={toggleMenu} aria-label="Toggle menu">
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="text-3xl font-bold tracking-tighter me-4">
              MS Foods
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-black hover:text-gray-600 transition-colors flex items-center"
                >
                  {link.name}
                  {link.hasChildren && <ChevronDown className="ml-1 h-4 w-4" />}
                </Link>
              ))}
            </nav>

            {/* Search bar */}
            <div className="hidden lg:flex relative flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            {/* Mobile search bar */}
            <div className="flex lg:hidden relative flex-1 max-w-xs mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            {/* Account and cart buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/account"
                className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Rs.000 (0)</span>
              </Link>
            </div>

            {/* Mobile cart icon */}
            <Link href="/cart" className="lg:hidden">
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </div>

          {/* Info bar - desktop */}
          <div className="hidden lg:flex items-center justify-center mt-6 space-x-12">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Minimum Order Amount</p>
                <p className="text-sm font-bold">Rs 3,000</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Delivery Timings</p>
                <p className="text-sm font-bold">10am to 6pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info bar - mobile */}
      <div className="lg:hidden bg-gray-50 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <div>
            <p className="text-xs font-medium">Minimum Order Amount</p>
            <p className="text-sm font-bold">Rs 3,000</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <div>
            <p className="text-xs font-medium">Delivery Timings</p>
            <p className="text-sm font-bold">10am to 6pm</p>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white z-50 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-medium">Menu</h2>
              <button onClick={toggleMenu} className="text-black" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-medium">Minimum Order Amount</p>
                    <p className="text-sm font-bold">Rs 3,000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-xs font-medium">Delivery Timings</p>
                    <p className="text-sm font-bold">10am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="p-0">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between p-4 border-b text-black hover:bg-gray-50 transition-colors"
                >
                  <span>{link.name}</span>
                  {link.hasChildren && <ChevronRight className="h-5 w-5" />}
                </Link>
              ))}
              <Link
                href="/account"
                className="flex items-center p-4 border-b text-black hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span>Account</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header

