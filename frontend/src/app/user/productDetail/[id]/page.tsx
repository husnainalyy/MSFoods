"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/app/Component/CartContext"
import ReviewSection from "./ReviewSection"

interface Category {
    _id: string
    name: string
}

interface Product {
    _id: string
    name: string
    description: string
    price: number
    sizes: string[]
    categories: Category[]
    stock: number
    images: { public_id: string; url: string; _id: string; id: string }[]
    ratings: number
    numOfReviews: number
    slug: string
}

interface ApiResponse {
    success: boolean
    message: string
    data: Product
}



interface Review {
    _id: string
    user: {
        _id: string
        name: string
    }
    rating: number
    comment: string
    images: string[]
    createdAt: string
}

interface ReviewsResponse {
    success: boolean
    message: string
    data: {
        reviews: Review[]
        total: number
        pages: number
        page: number
    }
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function ProductPage() {
    const params = useParams()
    const { id } = params

    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const { cart, addToCart } = useCart()
    const { toast } = useToast()

    const fetchRelatedProducts = useCallback(
        async (categories: Category[]) => {
            try {
                const categoryIds = categories.map((cat) => cat._id).join(",")
                const res = await fetch(`${API_URL}/api/products/by-categories?categories=${categoryIds}`)
                if (!res.ok) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch related products",
                        variant: "destructive",
                    })
                }
                const data = await res.json()
                if (!data.success) {
                    toast({
                        title: "Error",
                        description: "Failed  to fetch related products",
                        variant: "destructive",
                    })
                }
                // Store all products except current one
                const filteredProducts = data.data.filter((p: Product) => p._id !== id)
                setRelatedProducts(filteredProducts)
            } catch (err:unknown) {
                toast({
                    title: "Error",
                    description: "Error fetching related products: " + (err instanceof Error ? err.message : "Unknown error"),
                    variant: "destructive",
                })
            }
        },
        [id,toast],
    )

    useEffect(() => {
        if (!id) return

        const fetchProductAndReviews = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    fetch(`${API_URL}/api/products/${id}`),
                    fetch(`${API_URL}/api/reviews/${id}`),
                ])

                if (!productRes.ok || !reviewsRes.ok) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch product or reviews",
                        variant: "destructive",
                    })
                }

                const productData: ApiResponse = await productRes.json()
                const reviewsData: ReviewsResponse = await reviewsRes.json()

                if (!productData.success || !reviewsData.success) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch product or reviews" + productData.message || reviewsData.message,
                        variant: "destructive",
                    })
                }

                setProduct(productData.data)
                setSelectedImage(productData.data.images[0]?.url || null)
                setReviews(reviewsData.data.reviews)
                await fetchRelatedProducts(productData.data.categories)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductAndReviews()
    }, [id, fetchRelatedProducts, toast])

    const handleImageClick = (url: string) => {
        setSelectedImage(url)
    }

    const handleAddToCart = () => {
        if (!product) return

        const currentCartItem = cart.find((item) => item.id === product._id)
        const currentQuantity = currentCartItem?.quantity || 0

        if (currentQuantity >= product.stock) {
            toast({
                title: "Error",
                description: `Cannot add more items. Maximum stock (${product.stock}) reached.`,
                variant: "destructive",
            })
            return
        }

        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0]?.url || "",
            stock: product.stock,
        })

        toast({
            title: "Success",
            description: "Added to cart successfully",
        })
    }

    if (isLoading) {
        return <LoadingState />
    }

    if (error || !product) {
        return <ErrorState error={error} />
    }

    return (
        <div className="mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden">
                        <Image
                            src={selectedImage || "/placeholder.svg"}
                            alt={product.name}
                            width={600}
                            height={400}
                            className="object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {product.images.map((image) => (
                            <div
                                key={image.id}
                                className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => handleImageClick(image.url)}
                            >
                                <Image
                                    src={image.url || "/placeholder.svg"}
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-600">{product.description}</p>
                    <p className="text-2xl font-semibold">Rs {product.price.toFixed(2)}</p>
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Sizes:</h2>
                        <div className="flex space-x-2">
                            {product.sizes.map((size) => (
                                <span key={size} className="px-3 py-1 border rounded-full text-sm">
                                    {size}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Categories:</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.categories.map((category) => (
                                <span key={category._id} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={product.stock === 0}
                    >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
            <ReviewSection reviews={reviews} />
            <RelatedProducts products={relatedProducts} />
            <FAQ />
            <RecentProducts currentProductId={product._id} />
        </div>
    )
}

function LoadingState() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="aspect-w-3 aspect-h-2 bg-gray-300 rounded-lg"></div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="aspect-w-1 aspect-h-1 bg-gray-300 rounded-lg"></div>
                            <div className="aspect-w-1 aspect-h-1 bg-gray-300 rounded-lg"></div>
                            <div className="aspect-w-1 aspect-h-1 bg-gray-300 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-20 bg-gray-300 rounded"></div>
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                            <div className="flex space-x-2">
                                <div className="h-8 w-16 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-16 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-16 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                            <div className="flex space-x-2">
                                <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                        <div className="h-10 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ErrorState({ error }: { error: string | null }) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-xl mb-8">{error || "An error occurred while fetching the product."}</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Go back to Home
            </Link>
        </div>
    )
}

function RecentProducts({ currentProductId }: { currentProductId: string }) {
    const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const { toast } = useToast()
    useEffect(() => {
        const fetchRecentProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products/recent`)
                if (!res.ok) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch recent products",
                        variant: "destructive",
                    })
                }
                const data = await res.json()
                if (!data.success) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch recent products",
                        variant: "destructive",
                    })
                }
                setRecentProducts(data.data.filter((product: Product) => product._id !== currentProductId).slice(0, 4))
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Error fetching recent products: " + (err instanceof Error ? err.message : "Unknown error"),
                    variant: "destructive",
                })
            }
        }

        fetchRecentProducts()
    }, [currentProductId, toast])

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 px-4">Recent Products</h2>
            <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4">
                {recentProducts.slice(0, 4).map((product) => (
                    <Link href={`/user/productDetail/${product._id}`} key={product._id}>
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative aspect-square">
                                <Image
                                    src={product.images[0]?.url || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-t-lg"
                                />
                            </div>
                            <div className="p-2 sm:p-3">
                                <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                                <p className="text-sm font-semibold text-gray-900">Rs {product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    const faqs = [
        {
            question: "What materials are your water bottles made from?",
            answer:
                "Our water bottles are made from high-quality, BPA-free materials such as stainless steel, glass, and durable plastics. Each product description specifies the exact material used.",
        },
        {
            question: "Are your water bottles dishwasher safe?",
            answer:
                "Most of our water bottles are dishwasher safe, but we recommend checking the care instructions for each specific product. Some bottles with special coatings or insulation may require hand washing.",
        },
        {
            question: "How long do your insulated bottles keep drinks cold or hot?",
            answer:
                "Our insulated bottles typically keep drinks cold for up to 24 hours and hot for up to 12 hours. However, this can vary depending on the specific model and environmental conditions.",
        },
        {
            question: "Do you offer a warranty on your water bottles?",
            answer:
                "Yes, we offer a limited warranty on manufacturing defects for all our water bottles. The duration of the warranty varies by product, so please check the product details or contact our customer service for specific information.",
        },
        {
            question: "How do I clean my water bottle?",
            answer:
                "For regular cleaning, use warm soapy water and a bottle brush. For deep cleaning, you can use a mixture of vinegar and water or denture tablets. Always rinse thoroughly after cleaning. For specific care instructions, refer to the product manual.",
        },
    ]

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg">
                        <button
                            className="flex justify-between items-center w-full p-4 text-left"
                            onClick={() => toggleQuestion(index)}
                        >
                            <span className="font-semibold">{faq.question}</span>
                            {openIndex === index ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {openIndex === index && (
                            <div className="p-4 bg-gray-50">
                                <p>{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function RelatedProducts({ products }: { products: Product[] }) {
    const uniqueProducts = Array.from(new Map(products.map((item) => [item._id, item])).values()).slice(0, 4)

    if (uniqueProducts.length === 0) {
        return null
    }

    return (
        <section className="py-8">
            <div className=" ">
                <div className="px-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
                    <p className="mt-1 text-sm text-gray-600">Products you might also like</p>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4">
                    {uniqueProducts.map((product) => (
                        <Link href={`/user/productDetail/${product._id}`} key={product._id} className="group">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="relative aspect-square">
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.stock <= 0 && (
                                        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            Out of Stock
                                        </div>
                                    )}
                                    {product.stock > 0 && product.stock <= 5 && (
                                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            Low Stock
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 sm:p-3">
                                    <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm font-semibold text-gray-900">Rs {product.price.toLocaleString()}</p>
                                        {product.stock > 0 && <span className="text-xs text-gray-500">{product.stock} left</span>}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {product.sizes.slice(0, 2).map((size) => (
                                            <span
                                                key={size}
                                                className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                        {product.sizes.length > 2 && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                                                +{product.sizes.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

