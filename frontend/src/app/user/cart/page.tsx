"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/app/Component/CartContext"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

async function verifyCartStock(cartItems: { id: string; quantity: number }[]) {
    try {
        // Fetch current stock levels for all cart items
        const stockChecks = await Promise.all(
            cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/products/${item.id}`, {
                    credentials: "include",
                })

                if (!response.ok) {
                    
                    throw new Error(`Failed to fetch stock for product ${item.id}`)
                }

                const data = await response.json()
                return {
                    id: item.id,
                    availableStock: data.data.stock,
                }
            }),
        )

        // Compare requested quantities with available stock
        const adjustments = stockChecks.map((check) => {
            const cartItem = cartItems.find((item) => item.id === check.id)
            return {
                id: check.id,
                availableStock: check.availableStock,
                requestedQuantity: cartItem?.quantity || 0,
                needsAdjustment: (cartItem?.quantity || 0) > check.availableStock,
            }
        })

        return {
            success: true,
            adjustments,
            canProceed: adjustments.some((item) => item.availableStock > 0),
        }
    } catch  {
        return {
            success: false,
            error: "Failed to verify stock availability",
        }
    }
}

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart } = useCart()
    const router = useRouter()
    const { toast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const handleCheckout = async () => {
        setIsProcessing(true)
        try {
            // Verify stock availability
            const verification = await verifyCartStock(cart.map((item) => ({ id: item.id, quantity: item.quantity })))

            if (!verification.success) {
                toast({
                    title: "Error",
                    description: verification.error,
                    variant: "destructive",
                })
                return
            }

            if (!verification.canProceed) {
                toast({
                    title: "Error",
                    description: "No items available in stock",
                    variant: "destructive",
                })
                return
            }

            // Handle stock adjustments if needed
            let quantityAdjusted = false
            verification.adjustments.forEach((adjustment) => {
                if (adjustment.needsAdjustment) {
                    updateQuantity(adjustment.id, adjustment.availableStock)
                    quantityAdjusted = true
                }
            })

            if (quantityAdjusted) {
                toast({
                    title: "Cart Updated",
                    description: "Some item quantities were adjusted due to stock availability",
                })
                // Give time for the user to see the changes
                await new Promise((resolve) => setTimeout(resolve, 1500))
            }

            // Proceed to checkout
            router.push("/user/checkout")
        } catch  {
            toast({
                title: "Error",
                description: "Failed to process checkout. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="h-96 flex justify-center items-center">
                <div className="container mx-auto px-4 py-8 text-center">
                    <ShoppingBag className="mx-auto mb-4" size={80} />
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center border-b py-4">
                            <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded-md"
                            />
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">{item.name}</h2>
                                <p className="text-gray-600">Rs {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="px-2 py-1 border rounded"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="mx-2">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="px-2 py-1 border rounded"
                                    disabled={item.quantity >= item.stock}
                                >
                                    +
                                </button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="md:col-span-1">
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>Rs {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold">Rs {total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Verifying Stock..." : "Proceed to Checkout"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

