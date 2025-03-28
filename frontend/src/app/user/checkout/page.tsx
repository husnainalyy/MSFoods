"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/app/Component/CartContext"
import { useUser } from "@/app/Component/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
    CreditCard,
    Truck,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Tag,
    AlertCircle,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Cookies from "js-cookie"

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function CheckoutPage() {
    const { cart, getTotalItems, getTotalPrice, clearCart } = useCart()
    const { user, isAuthenticated } = useUser()
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "PayFast">("COD")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true)
    const [shippingCost, setShippingCost] = useState(150)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Pakistan",
    })

    // Calculate order summary
    const subtotal = getTotalPrice()
    const discount = couponApplied ? couponDiscount : 0
    const orderTotal = subtotal + shippingCost - discount

    // Fetch shipping cost from backend
    const fetchShippingCost = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                credentials: "include",
            })
            const data = await response.json()
            if (data.shippingFee) {
                setShippingCost(data.shippingFee)
            }
        } catch (error) {
            console.error("Failed to fetch shipping cost:", error)
            toast({
                title: "Error",
                description: "Failed to fetch shipping cost. Using default value.",
                variant: "destructive",
            })
        }
    }, [toast])

    // Fill user data if logged in
    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                fullName: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            }))
        }
    }, [user])

    // Fetch shipping cost on page load
    useEffect(() => {
        fetchShippingCost()
    }, [fetchShippingCost])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast({
                title: "Please enter a coupon code",
                variant: "destructive",
            })
            return
        }

        // Check if user is authenticated before applying coupon
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to apply a coupon code",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)

            // Get the access token
            const accessToken = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken") || ""

            if (!accessToken) {
                throw new Error("Authentication required to apply coupon")
            }

            const response = await fetch(`${API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
                credentials: "include",
            })

            const data = await response.json()

            if (data.success) {
                setCouponDiscount(data.data.discount)
                setCouponApplied(true)
                toast({
                    title: "Coupon applied!",
                    description: `You saved Rs.${data.data.discount.toLocaleString()}`,
                })
            } else {
                throw new Error(data.message || "Invalid coupon code")
            }
        } catch (error) {
            toast({
                title: "Coupon Error",
                description: error instanceof Error ? error.message : "Failed to apply coupon",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validate required fields
            const requiredFields = ["fullName", "email", "phone", "address", "city", "postalCode"]
            const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
            }

            // Check if user is authenticated when using coupon
            if (couponApplied && !isAuthenticated) {
                throw new Error("Authentication required to use coupon. Please log in.")
            }

            // Prepare order items
            const items = cart.map((item) => ({
                productId: item.id,
                priceOptionId: item.priceOptionId,
                quantity: item.quantity,
            }))

            // Create order payload
            const orderData = {
                items,
                shippingAddress: {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    email: formData.email,
                    phone: formData.phone,
                },
                paymentMethod,
                couponCode: couponApplied ? couponCode : undefined,
                subtotal,
                shippingCost,
                discount,
                totalAmount: orderTotal,
            }

            // Get the access token
            const accessToken = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken") || ""

            // Create order
            const response = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(user ? { Authorization: `Bearer ${accessToken}` } : {}) // Only send token if logged in
                },
                body: JSON.stringify(orderData),
                credentials: "include",
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.message || "Order failed")

            // Handle payment redirect
            if (paymentMethod === "PayFast" && data.data?.paymentResult?.redirectUrl) {
                window.location.href = data.data.paymentResult.redirectUrl
            } else {
                clearCart()
                router.push("/user/checkout/success")
            }
        } catch (error) {
            toast({
                title: "Order Error",
                description: error instanceof Error ? error.message : "Failed to place order",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponCode("")
        setCouponApplied(false)
        setCouponDiscount(0)
        toast({
            title: "Coupon removed",
            description: "The coupon has been removed from your order.",
        })
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
                <div className="mb-8">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mt-2 text-gray-500">Please add items to your cart before proceeding to checkout.</p>
                </div>
                <Link href="/products">
                    <Button className="bg-purple-600 hover:bg-purple-700">Browse Products</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/cart" className="text-purple-600 hover:text-purple-800 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to cart
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {/* Authentication warning for coupon usage */}
                {!isAuthenticated && (
                    <Alert variant="warning" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Authentication Required for Coupons</AlertTitle>
                        <AlertDescription>
                            You need to{" "}
                            <Link href="/login" className="font-medium underline">
                                log in
                            </Link>{" "}
                            to apply or use coupon codes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Order Summary - Mobile Only (Top) */}
                <div className="lg:hidden mb-6">
                    <OrderSummaryCollapsible
                        cart={cart}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        discount={discount}
                        orderTotal={orderTotal}
                        isOpen={isOrderSummaryOpen}
                        setIsOpen={setIsOrderSummaryOpen}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        couponApplied={couponApplied}
                        handleApplyCoupon={handleApplyCoupon}
                        handleRemoveCoupon={handleRemoveCoupon}
                        isSubmitting={isSubmitting}
                        isAuthenticated={isAuthenticated}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} id="checkout-form">
                            {/* Contact Information */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="address">Street Address</Label>
                                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" value={formData.country} onChange={handleInputChange} disabled />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as "COD" | "PayFast")}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-md">
                                        <RadioGroupItem value="COD" id="cod" />
                                        <Label htmlFor="cod" className="flex items-center cursor-pointer">
                                            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                                            Cash on Delivery
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-md">
                                        <RadioGroupItem value="PayFast" id="payfast" />
                                        <Label htmlFor="payfast" className="flex items-center cursor-pointer">
                                            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                                            PayFast (Credit/Debit Card)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="lg:hidden">
                                <Button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Place Order"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary - Desktop Only */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-6">
                            <OrderSummaryCollapsible
                                cart={cart}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                discount={discount}
                                orderTotal={orderTotal}
                                isOpen={true}
                                setIsOpen={() => { }}
                                couponCode={couponCode}
                                setCouponCode={setCouponCode}
                                couponApplied={couponApplied}
                                handleApplyCoupon={handleApplyCoupon}
                                handleRemoveCoupon={handleRemoveCoupon}
                                isSubmitting={isSubmitting}
                                isAuthenticated={isAuthenticated}
                            />

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : "Place Order"}
                            </Button>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Truck className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>Free shipping on orders over Rs.2,000</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <ShieldCheck className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>Secure payment processing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface OrderSummaryProps {
    cart: any[]
    subtotal: number
    shippingCost: number
    discount: number
    orderTotal: number
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    couponCode: string
    setCouponCode: (code: string) => void
    couponApplied: boolean
    handleApplyCoupon: () => void
    handleRemoveCoupon: () => void
    isSubmitting: boolean
    isAuthenticated: boolean
}

function OrderSummaryCollapsible({
    cart,
    subtotal,
    shippingCost,
    discount,
    orderTotal,
    isOpen,
    setIsOpen,
    couponCode,
    setCouponCode,
    couponApplied,
    handleApplyCoupon,
    handleRemoveCoupon,
    isSubmitting,
    isAuthenticated,
}: OrderSummaryProps) {
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                        <p className="text-sm text-gray-500">
                            {cart.length} {cart.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 font-medium">Rs.{orderTotal.toLocaleString()}</span>
                        {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <Separator />
                    <div className="p-6">
                        <div className="max-h-80 overflow-y-auto mb-4">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.priceOptionId}`} className="flex py-4 border-b border-gray-200">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image || "/placeholder.svg?height=64&width=64"}
                                            alt={item.name}
                                            fill
                                            className="object-contain"
                                        />
                                        <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                        {item.weightType === "weight-based" && <p className="text-xs text-gray-500">{item.weight}g</p>}
                                        <p className="text-sm text-gray-900 mt-1">
                                            Rs.{item.price.toLocaleString()} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Rs.{(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Code */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Discount Code</h3>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={couponApplied || isSubmitting || !isAuthenticated}
                                    />
                                </div>
                                {couponApplied ? (
                                    <Button type="button" variant="outline" onClick={handleRemoveCoupon} disabled={isSubmitting}>
                                        Remove
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={isSubmitting || !isAuthenticated}
                                    >
                                        {isSubmitting ? "..." : "Apply"}
                                    </Button>
                                )}
                            </div>
                            {!isAuthenticated && <p className="mt-2 text-xs text-amber-600">Please log in to use coupon codes</p>}
                            {couponApplied && (
                                <div className="mt-2 flex items-center text-sm text-green-600">
                                    <Tag className="h-4 w-4 mr-1" />
                                    <span>Discount of Rs.{discount.toLocaleString()} applied</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="text-sm font-medium text-gray-900">Rs.{subtotal.toLocaleString()}</p>
                            </div>

                            <div className="flex justify-between">
                                <p className="text-sm text-gray-600">Shipping</p>
                                <p className="text-sm font-medium text-gray-900">Rs.{shippingCost.toLocaleString()}</p>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-600">Discount</p>
                                    <p className="text-sm font-medium text-green-600">-Rs.{discount.toLocaleString()}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="flex justify-between">
                                <p className="text-base font-medium text-gray-900">Total</p>
                                <p className="text-base font-medium text-gray-900">Rs.{orderTotal.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

