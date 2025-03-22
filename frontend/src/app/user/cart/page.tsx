"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2, RefreshCw } from 'lucide-react'
import { useCart } from "@/app/Component/CartContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    // Calculate cart total
    const total = getTotalPrice()

    const handleQuantityChange = (id: string, priceOptionId: string, newQuantity: number) => {
        setIsUpdating(`${id}-${priceOptionId}`)
        updateQuantity(id, priceOptionId, newQuantity)
        setTimeout(() => setIsUpdating(null), 500)
    }

    const handleRemoveItem = (id: string, priceOptionId: string, name: string) => {
        removeFromCart(id, priceOptionId)
        toast({
            title: "Item removed",
            description: `${name} has been removed from your cart.`,
        })
    }

    const handleClearCart = () => {
        clearCart()
        toast({
            title: "Cart cleared",
            description: "All items have been removed from your cart.",
        })
    }

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast({
                title: "Cart is empty",
                description: "Please add items to your cart before checking out.",
                variant: "destructive",
            })
            return
        }

        // Navigate to checkout page
        router.push("/user/checkout")
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mt-2 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
                    <div className="mt-6">
                        <Link href="/user/products">
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {cart.map((item) => (
                                    <div
                                        key={`${item.id}-${item.priceOptionId}`}
                                        className="p-6"
                                    >
                                        <div className="sm:flex sm:items-center">
                                            {/* Product Image */}
                                            <div className="relative h-24 w-24 rounded-md overflow-hidden sm:mr-6 flex-shrink-0">
                                                <Image
                                                    src={item.image || "/placeholder.svg?height=96&width=96"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="mt-4 sm:mt-0 flex-1">
                                                <h3 className="text-base font-medium text-gray-900">
                                                    <Link href={`/user/product/${item.id}`} className="hover:text-purple-600">
                                                        {item.name}
                                                    </Link>
                                                </h3>
                                                <div className="mt-1 flex text-sm text-gray-500">
                                                    {item.weightType === "weight-based" && (
                                                        <p>{item.weight}g</p>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    Rs.{item.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quantity Controls and Price - All in one line */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button
                                                    type="button"
                                                    className="p-2 text-gray-600 hover:text-gray-900"
                                                    onClick={() => handleQuantityChange(item.id, item.priceOptionId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center">
                                                    {isUpdating === `${item.id}-${item.priceOptionId}` ? (
                                                        <RefreshCw className="h-4 w-4 mx-auto animate-spin" />
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="p-2 text-gray-600 hover:text-gray-900"
                                                    onClick={() => handleQuantityChange(item.id, item.priceOptionId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center">
                                                <p className="text-base font-medium text-gray-900 mr-4">
                                                    Rs.{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="text-gray-400 hover:text-red-500"
                                                    onClick={() => handleRemoveItem(item.id, item.priceOptionId, item.name)}
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Actions */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
                                <button
                                    type="button"
                                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                    onClick={handleClearCart}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Clear Cart
                                </button>
                                <Link href="/user/products" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Update Cart
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary - Simplified */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">Items ({getTotalItems()})</p>
                                    <p className="text-sm font-medium text-gray-900">Rs.{total.toLocaleString()}</p>
                                </div>

                                <Separator />

                                <div className="flex justify-between">
                                    <p className="text-base font-medium text-gray-900">Total</p>
                                    <p className="text-base font-medium text-gray-900">Rs.{total.toLocaleString()}</p>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Shipping and other fees will be calculated at checkout
                                </p>
                            </div>

                            <div className="mt-6">
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-4">
                                <Link href="/user/products">
                                    <Button variant="outline" className="w-full">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
