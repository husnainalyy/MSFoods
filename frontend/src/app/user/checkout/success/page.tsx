"use client"

import Link from "next/link"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function OrderSuccessPage() {
    // Generate a random order number
    const orderNumber = `MS-${Math.floor(100000 + Math.random() * 900000)}`
    const orderDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
                    <p className="mt-2 text-lg text-gray-500">Your order has been placed and is being processed.</p>
                </div>

                <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900">Order #{orderNumber}</h2>
                        <p className="mt-1 text-sm text-gray-500">Placed on {orderDate}</p>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Order Details</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                A confirmation email has been sent to your email address with all the order details.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your order will be processed within 24 hours and shipped via our delivery partner.
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Package className="h-5 w-5 mr-2 text-gray-400" />
                                <span>Estimated delivery: 3-5 business days</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Payment</h3>
                            <p className="mt-1 text-sm text-gray-500">Payment will be collected upon delivery.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link href="/products">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>

                    <Link href="/account/orders">
                        <Button className="bg-purple-600 hover:bg-purple-700 flex items-center">
                            View Order History
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

