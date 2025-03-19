"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { useUser } from "./user-context"
import { useSearch } from "@/hooks/useSearch"
import { useCart } from "./CartContext"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, User, ShoppingBag, Menu, X, Loader2 } from "lucide-react"

interface DecodedToken {
    exp: number
    id: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

export default function Header() {
    const { toast } = useToast()
    const router = useRouter()
    const { user, setUser } = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const { searchTerm, setSearchTerm, searchResults, isLoading: isSearching } = useSearch()
    const { getTotalItems } = useCart()

    // State for search dropdown visibility
    const [showSearchResults, setShowSearchResults] = useState(false)

    // State for login dropdown
    const [showLoginDropdown, setShowLoginDropdown] = useState(false)

    // State for mobile menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // State for search modal (mobile)
    const [searchModalOpen, setSearchModalOpen] = useState(false)

    // State for header visibility and color on scroll
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [isScrolled, setIsScrolled] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Refs for click outside detection
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const loginDropdownRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const searchModalRef = useRef<HTMLDivElement>(null)

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user || !user.name) return ""

        const nameParts = user.name.split(" ")
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase()
        } else {
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
        }
    }

    useEffect(() => {
        const checkAuthState = () => {
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            if (!token) return null

            try {
                const decoded = jwtDecode<DecodedToken>(token)
                const currentTime = Date.now() / 1000
                if (decoded.exp < currentTime) return null
                const storedUser = localStorage.getItem("user")
                return storedUser ? JSON.parse(storedUser) : null
            } catch {
                return null
            }
        }

        const checkAuth = async () => {
            try {
                const localUser = checkAuthState()
                if (localUser) {
                    setUser(localUser)
                    setIsLoading(false)
                    return
                }

                const response = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: "include",
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData.data)
                    localStorage.setItem("user", JSON.stringify(userData.data))
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
                toast({
                    title: "Error",
                    description: "Auth check failed: " + errorMessage,
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [setUser, toast])

    // Handle scroll behavior for header
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY

            // Set scrolled state for color change
            if (currentScrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }

            // Control visibility based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past threshold - hide header
                setIsHeaderVisible(false)
            } else {
                // Scrolling up - show header
                setIsHeaderVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", controlHeader)

        return () => {
            window.removeEventListener("scroll", controlHeader)
        }
    }, [lastScrollY])

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            })

            if (response.ok) {
                localStorage.removeItem("user")
                setUser(null)
                router.push("/auth/login")
                toast({
                    title: "Logged out successfully",
                })
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Logout failed",
                description: "Please try again",
            })
        }
    }

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/user/allProduct" },
        { label: "About", href: "/user/about" },
        { label: "Faqs", href: "/user/faqs" },
        { label: "Insights", href: "/user/feedback" },
        { label: "Contact", href: "/user/contact" },
    ]

    // Handle clicks outside
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSearchResults(false)
        }

        if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
            setShowLoginDropdown(false)
        }

        if (
            mobileMenuRef.current &&
            !mobileMenuRef.current.contains(event.target as Node) &&
            !(event.target as Element).closest(".mobile-menu-button")
        ) {
            setMobileMenuOpen(false)
        }

        if (
            searchModalRef.current &&
            !searchModalRef.current.contains(event.target as Node) &&
            !(event.target as Element).closest(".search-button")
        ) {
            setSearchModalOpen(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [handleClickOutside])

    // Show search results when the search term changes and is not empty
    useEffect(() => {
        if (searchTerm.trim() !== "") {
            setShowSearchResults(true)
        } else {
            setShowSearchResults(false)
        }
    }, [searchTerm])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen || searchModalOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.body.style.overflow = ""
        }
    }, [mobileMenuOpen, searchModalOpen])

    return (
        <>
            
            {/* Desktop Header */}
            <div>
              
                <header
                    className={`${isScrolled ? "bg-[#FAF0E6]" : "bg-[#FAF0E6]"} fixed top-0 left-0 right-0 z-40 border-b border-[#B8860B]/20 hidden md:block transition-all duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                        }`}
                >
                    <div className="container mx-auto px-4">
                        <div className="flex h-[74px] items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className=" text-3xl text-[#800020]">
                                MS Foods
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="flex items-center gap-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-[15px] font-semibold uppercase tracking-wide text-[#333333] hover:text-[#800020] transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Right side items */}
                            <div className="flex items-center gap-6">
                                {/* Search Icon */}
                                <button
                                    className="search-button text-[#333333] hover:text-[#800020] transition-colors"
                                    onClick={() => setSearchModalOpen(true)}
                                >
                                    <Search size={24} />
                                </button>

                                {/* User Account */}
                                <div className="relative" ref={loginDropdownRef}>
                                    <button
                                        className="cursor-pointer text-[#333333] hover:text-[#800020] transition-colors"
                                        onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : user ? (
                                            <Avatar className="h-8 w-8 border border-[#B8860B]/30">
                                                <AvatarFallback className="bg-[#800020] text-white">{getUserInitials()}</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </button>

                                    {showLoginDropdown && !user && (
                                        <div className="login-popup absolute top-full right-0 mt-2 w-[320px] p-7 rounded-xl bg-white shadow-md z-50 border border-[#B8860B]/20">
                                            <Link
                                                href="/auth/login"
                                                className="block w-full py-2.5 px-4 bg-[#800020] text-white text-center rounded-md font-medium hover:bg-[#800020]/90 transition-colors"
                                            >
                                                LOGIN
                                            </Link>
                                            <div className="text-sm text-[#333333]/70 text-center mt-3 pb-4">
                                                Dont have an account?{" "}
                                                <Link href="/auth/signup" className="text-[#800020] hover:underline">
                                                    Register
                                                </Link>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block w-full py-2.5 px-4 bg-white text-[#333333] text-center rounded-md font-medium border border-[#B8860B] hover:bg-[#FAF0E6] transition-colors"
                                            >
                                                DASHBOARD
                                            </Link>
                                            <div className="border-t border-[#B8860B]/20 mt-4 pt-4"></div>
                                            <Link
                                                href="#"
                                                className="text-sm text-[#333333] hover:text-[#800020] hover:underline transition-colors"
                                            >
                                                Support
                                            </Link>
                                        </div>
                                    )}

                                    {showLoginDropdown && user && (
                                        <div className="login-popup absolute top-full right-0 mt-2 w-[200px] py-2 bg-white shadow-md rounded-md z-50 border border-[#B8860B]/20">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#FAF0E6] hover:text-[#800020] transition-colors"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/user/myOrders"
                                                className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#FAF0E6] hover:text-[#800020] transition-colors"
                                            >
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-[#800020] hover:bg-[#FAF0E6] transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <Link href="/user/cart" className="relative text-[#333333] hover:text-[#800020] transition-colors">
                                    <ShoppingBag size={24} />
                                    {getTotalItems() > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#B8860B] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

            </div>

            {/* Mobile Header */}
            <header
                className={`${isScrolled ? "bg-white" : "bg-[#FAF0E6]"} fixed top-0 left-0 right-0 z-40 border-b border-[#B8860B]/20 md:hidden transition-all duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-[56px] items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button className="mobile-menu-button text-[#333333]" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="font-bold text-2xl absolute left-1/2 -translate-x-1/2 text-[#800020]">
                            MS Foods
                        </Link>

                        {/* Cart */}
                        <Link href="/user/cart" className="relative text-[#333333]">
                            <ShoppingBag size={22} />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#B8860B] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {getTotalItems()}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Add a spacer to prevent content from being hidden under the fixed header + announcement bar */}
            <div className="h-[74px] md:block hidden"></div>
            <div className="h-[56px] md:hidden block"></div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
                    <div ref={mobileMenuRef} className="bg-[#FAF0E6] h-full w-[300px] max-w-[80vw] overflow-y-auto">
                        <div className="p-4 border-b border-[#B8860B]/20 flex items-center justify-between">
                            <button onClick={() => setMobileMenuOpen(false)} className="text-[#333333]">
                                <X size={24} />
                            </button>
                            <div className="text-xl font-semibold text-[#800020]">MS Foods</div>
                        </div>

                        <div className="p-4">
                            {user && (
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#B8860B]/20">
                                    <Avatar className="h-10 w-10 border border-[#B8860B]/30">
                                        <AvatarFallback className="bg-[#800020] text-white">{getUserInitials()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        {user.email && <div className="text-sm text-[#333333]/70">{user.email}</div>}
                                    </div>
                                </div>
                            )}

                            <div className="relative mb-6">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]/70" />
                                <input
                                    type="search"
                                    placeholder="What are you looking for?"
                                    className="w-full pl-10 pr-4 py-2.5 border border-[#B8860B]/30 rounded-md bg-white text-[#333333]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {showSearchResults && searchResults.length > 0 && (
                                    <div className="absolute mt-1 w-full bg-white border border-[#B8860B]/20 rounded-md shadow-lg z-10">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {searchResults.map((product: any) => (
                                            <Link
                                                key={product._id}
                                                href={`/user/productDetail/${product._id}`}
                                                className="block px-4 py-2 text-[#333333] hover:bg-[#FAF0E6] hover:text-[#800020]"
                                                onClick={() => {
                                                    setShowSearchResults(false)
                                                    setMobileMenuOpen(false)
                                                }}
                                            >
                                                {product.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <nav className="space-y-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between py-2 border-b border-[#B8860B]/20 text-base font-medium text-[#333333]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                      
                                    </Link>
                                ))}
                            </nav>

                            {!user ? (
                                <div className="mt-6 space-y-3">
                                    <Link
                                        href="/auth/login"
                                        className="block w-full py-2.5 px-4 bg-[#800020] text-white text-center rounded-md font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="block w-full py-2.5 px-4 bg-white text-[#333333] text-center rounded-md font-medium border border-[#B8860B]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-6 space-y-3">
                                    <Link
                                        href="/profile"
                                        className="block w-full py-2.5 px-4 bg-[#800020] text-white text-center rounded-md font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="block w-full py-2.5 px-4 bg-white text-[#800020] text-center rounded-md font-medium border border-[#800020]"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {searchModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
                    <div
                        ref={searchModalRef}
                        className="bg-white w-full max-w-2xl mx-4 p-6 rounded-lg border border-[#B8860B]/20"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#800020]">Search</h2>
                            <button onClick={() => setSearchModalOpen(false)} className="text-[#333333]">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]/70" />
                            <input
                                type="search"
                                placeholder="What are you looking for?"
                                className="w-full pl-10 pr-4 py-3 border border-[#B8860B]/30 rounded-md bg-[#FAF0E6]/50 text-[#333333]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-[#800020]" />
                            )}
                        </div>

                        {showSearchResults && searchResults.length > 0 && (
                            <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                <h3 className="text-sm font-medium text-[#B8860B] mb-2">Search Results</h3>
                                <div className="divide-y divide-[#B8860B]/20">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {searchResults.map((product: any) => (
                                        <Link
                                            key={product._id}
                                            href={`/user/productDetail/${product._id}`}
                                            className="block py-3 hover:bg-[#FAF0E6] transition-colors"
                                            onClick={() => {
                                                setShowSearchResults(false)
                                                setSearchModalOpen(false)
                                            }}
                                        >
                                            <div className="font-medium text-[#333333]">{product.name}</div>
                                            {product.price && <div className="text-sm text-[#800020] mt-1">${product.price.toFixed(2)}</div>}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchTerm.trim() !== "" && searchResults.length === 0 && !isSearching && (
                            <div className="mt-4 text-center py-8">
                                <p className="text-[#333333]/70">No results found for `&quot;` {searchTerm} `&quot;`</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

