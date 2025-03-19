"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Star, ShoppingCart, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.peachflask.com"

interface PriceOption {
    _id: string
    type: string
    weight: number
    price: number
    salePrice: number
}

interface Product {
    _id: string
    name: string
    description: string
    price?: number
    stock: number
    sizes?: string[]
    categories: string[]
    images: { public_id: string; url: string }[]
    slug: string
    priceOptions: PriceOption[]
    sale: number
    ratings?: number
    numOfReviews?: number
}

interface CartItem {
    product: Product
    option: PriceOption
    quantity: number
}

// Internal ProductCard component
function ProductCard({
    product,
    onAddToCart,
}: {
    product: Product
    onAddToCart?: (product: Product, selectedOption: PriceOption, quantity: number) => void
}) {
    const [selectedOption, setSelectedOption] = useState<PriceOption>(
        product.priceOptions[0] || { _id: "", type: "", weight: 0, price: 0, salePrice: 0 },
    )
    const [quantity, setQuantity] = useState(1)

    // Group options by type
    const packetOptions = product.priceOptions.filter((option) => option.type === "packet")
    const weightBasedOptions = product.priceOptions.filter((option) => option.type === "weight-based")

    // Format weight display
    const formatWeight = (weight: number) => {
        return weight >= 1000 ? `${weight / 1000} kg` : `${weight} g`
    }

    // Handle add to cart
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click event
        if (onAddToCart) {
            onAddToCart(product, selectedOption, quantity)
        }
    }

    // Handle quantity change
    const increaseQuantity = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click event
        setQuantity((prev) => Math.min(prev + 1, 10)) // Max 10 items
    }

    const decreaseQuantity = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click event
        setQuantity((prev) => Math.max(prev - 1, 1)) // Min 1 item
    }

    // Render stars based on rating
    const renderStars = (rating = 0) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />)
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4 half-filled" />)
            } else {
                stars.push(<Star key={i} className="text-yellow-400 h-4 w-4" />)
            }
        }

        return stars
    }

    return (
       
            <Card className="bg-[#FAF0E6] border-[#FAF0E6] shadow-none cursor-pointer  transition-shadow">
                <div className="relative">
                    {/* Product image with colored background */}
                    <div className="aspect-square relative border-[1px] border-black rounded-3xl">
                        <Image
                            src={product.images[0]?.url || "/placeholder.svg?height=300&width=300"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="object-contain w-full h-full p-4"
                        />
                    </div>

                    {/* Sale badge */}
                    {product.sale > 0 && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-md font-semibold">
                            Sale
                        </div>
                    )}
                </div>

                <div className="p-4">
                {/* Product name */}
                <Link href={`/user/productDetail/${product._id}`}>
                    <h3 className="font-semibold text-md line-clamp-1 mb-1">{product.name}</h3>
                </Link>
                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-2">
                        {renderStars(product.ratings || 4.5)}
                        <span className="text-gray-500 text-sm ml-1">
                            ({product.numOfReviews || Math.floor(Math.random() * 100) + 10})
                        </span>
                    </div>

                    {/* Price display */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-gray-500 line-through text-sm">Rs.{selectedOption.price.toFixed(2)}</span>
                            <span className="font-bold text-lg ml-2">Rs.{selectedOption.salePrice.toFixed(2)}</span>
                        </div>

                       
                    </div>

                    {/* Product type selection */}
                    <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                        <RadioGroup
                            value={selectedOption.type}
                            onValueChange={(value) => {
                                const newOption = product.priceOptions.find((opt) => opt.type === value) || product.priceOptions[0]
                                setSelectedOption(newOption)
                            }}
                            className="flex gap-3"
                        >
                            {packetOptions.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="packet" id={`packet-${product._id}`} />
                                    <Label htmlFor={`packet-${product._id}`}>Packet</Label>
                                </div>
                            )}
                            {weightBasedOptions.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="weight-based" id={`weight-${product._id}`} />
                                    <Label htmlFor={`weight-${product._id}`}>By Weight</Label>
                                </div>
                            )}
                        </RadioGroup>
                    </div>

                    {/* Weight/Package selection */}
                    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                        <RadioGroup
                            value={selectedOption._id}
                            onValueChange={(value) => {
                                const newOption = product.priceOptions.find((opt) => opt._id === value)
                                if (newOption) setSelectedOption(newOption)
                            }}
                            className="grid grid-cols-2 gap-2"
                        >
                            {product.priceOptions
                                .filter((option) => option.type === selectedOption.type)
                                .map((option) => (
                                    <div
                                        key={option._id}
                                        className={cn(
                                            "border rounded-full p-2 cursor-pointer text-center text-sm transition-all",
                                            selectedOption._id === option._id
                                                ? "border-[#9ACA3C] bg-[#9ACA3C]/10 shadow-sm"
                                                : "border-gray-300 hover:border-gray-400",
                                        )}
                                    >
                                        <RadioGroupItem value={option._id} id={option._id} className="sr-only" />
                                        <Label htmlFor={option._id} className="cursor-pointer w-full h-full flex flex-col items-center">
                                            {option.type === "weight-based" && (
                                                <span className="text-gray-600">{formatWeight(option.weight)}</span>
                                            )}
                                            <span className="font-semibold">Rs.{option.salePrice}</span>
                                        </Label>
                                    </div>
                                ))}
                        </RadioGroup>
                    </div>
                    {/* Quantity and Add to Cart */}
                    <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center border border-gray-300 rounded-l-md overflow-hidden">
                            <button
                                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                                onClick={decreaseQuantity}
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button
                                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                                onClick={increaseQuantity}
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                        <button
                            className="h-8 w-8 rounded-r-md bg-[#9ACA3C] hover:bg-[#8BB82F] transition-colors flex items-center justify-center"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>
            </Card>
       
    )
}

// Loading state component
function LoadingState() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">loading......</div>
        </div>
    )
}

// No products component
function NoProducts() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
                <p className="text-gray-600 mb-8">Check back later for more products!</p>
                <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 10 }}
                    transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 1,
                    }}
                >
                    <Image src="/noproduct.svg" alt="No Products" height={100} width={100} className="w-64 h-64 mx-auto" />
                </motion.div>
            </motion.div>
        </div>
    )
}

// Main ProductGrid component
export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([])
    const [visibleProducts, setVisibleProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])

    const productsPerLoad = 4

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch products")
            }

            setProducts(data.data.products)
            setVisibleProducts(data.data.products.slice(0, productsPerLoad))
        } catch (error) {
            console.error("Error fetching products:", error)
            setError(error instanceof Error ? error.message : "An unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreProducts = () => {
        const currentLength = visibleProducts.length
        const newProducts = products.slice(currentLength, currentLength + productsPerLoad)
        setVisibleProducts([...visibleProducts, ...newProducts])
    }

    const handleAddToCart = (product: Product, selectedOption: PriceOption, quantity: number) => {
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(
            (item) => item.product._id === product._id && item.option._id === selectedOption._id,
        )

        if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const updatedCart = [...cart]
            updatedCart[existingItemIndex].quantity += quantity
            setCart(updatedCart)
        } else {
            // Add new item if it doesn't exist
            setCart([...cart, { product, option: selectedOption, quantity }])
        }

        toast({
            title: "Added to cart",
            description: `${product.name} - ${quantity} item(s) added to your cart`,
        })
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    if (products.length === 0) {
        return <NoProducts />
    }

    return (
        <main className="flex flex-col items-center justify-between px-4">
            <div className="pb-10 w-full">
                <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
                {visibleProducts.length < products.length && (
                    <div className="mt-8 text-center">
                        <Button className="hover:bg-[#9ACA3C] bg-[#3A3A3A]" onClick={loadMoreProducts}>
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}

