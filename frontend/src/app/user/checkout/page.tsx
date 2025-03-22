"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/app/Component/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Tag } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function CheckoutPage() {
    const { cart, getTotalItems, getTotalPrice, clearCart } = useCart()
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Pakistan",
    })

    // Calculate order summary
    const subtotal = getTotalPrice()
    const shippingCost = subtotal > 0 ? 150 : 0
    const discount = couponApplied ? couponDiscount : 0
    const orderTotal = subtotal + shippingCost - discount

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            toast({
                title: "Please enter a coupon code",
                variant: "destructive",
            })
            return
        }

        // Simulate coupon validation
        if (couponCode.toUpperCase() === "MS10") {
            const discountAmount = subtotal * 0.1 // 10% discount
            setCouponDiscount(discountAmount)
            setCouponApplied(true)
            toast({
                title: "Coupon applied!",
                description: "10% discount has been applied to your order.",
            })
        } else if (couponCode.toUpperCase() === "WELCOME15") {
            const discountAmount = subtotal * 0.15 // 15% discount
            setCouponDiscount(discountAmount)
            setCouponApplied(true)
            toast({
                title: "Coupon applied!",
                description: "15% discount has been applied to your order.",
            })
        } else {
            toast({
                title: "Invalid coupon code",
                description: "Please check your coupon code and try again.",
                variant: "destructive",
            })
        }
    }

    const handleRemoveCoupon = () => {
        setCouponCode("")
        setCouponApplied(false)
        setCouponDiscount(0)
        toast({
            title: "Coupon removed",
            description: "The discount has been removed from your order.",
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (cart.length === 0) {
            toast({
                title: "Cart is empty",
                description: "Please add items to your cart before checking out.",
                variant: "destructive",
            })
            router.push("/user/products")
            return
        }

        setIsSubmitting(true)

        // Simulate order processing
        setTimeout(() => {
            setIsSubmitting(false)
            clearCart()

            // Show success toast
            toast({
                title: "Order placed successfully!",
                description: "Thank you for your purchase. You will receive a confirmation email shortly.",
            })

            // Redirect to success page
            router.push("/user/checkout/success")
        }, 2000)
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
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit}>
                            {/* Contact Information */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
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
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                    <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-md">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex items-center cursor-pointer">
                                            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                                            Cash on Delivery
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-md opacity-50">
                                        <RadioGroupItem value="card" id="card" disabled />
                                        <Label htmlFor="card" className="flex items-center cursor-not-allowed">
                                            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                                            Credit/Debit Card (Coming Soon)
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
                            />

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
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
                                        disabled={couponApplied}
                                    />
                                </div>
                                {couponApplied ? (
                                    <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                                        Remove
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleApplyCoupon} className="bg-purple-600 hover:bg-purple-700">
                                        Apply
                                    </Button>
                                )}
                            </div>
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

