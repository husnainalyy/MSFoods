"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/app/Component/CartContext"
import { useUser } from "@/app/Component/UserContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
}

interface ShippingAddress {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    email: string
    phone: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function CheckoutPage() {
    const { cart, clearCart } = useCart()
    const [subtotal, setSubtotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [shippingCost, setShippingCost] = useState(0)
    const { user } = useUser()

    const [couponCode, setCouponCode] = useState("")
    const [discount, setDiscount] = useState(0)
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        email: "",
        phone: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<"PayFast" | "COD">("PayFast")
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            setShippingAddress((prevAddress) => ({
                ...prevAddress,
                fullName: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            }))
        }
    }, [user, toast])

   

    useEffect(() => {
        setTotal(subtotal + shippingCost - discount)
    }, [subtotal, shippingCost, discount])

    const calculateSubtotal = (cartItems: CartItem[]) => {
        const newSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        setSubtotal(newSubtotal)
    }

    const fetchShippingCost = useCallback(async () => {
        console.log("error", error);
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                credentials: "include",
            });
            const data = await response.json();
            if (data.shippingFee) {
                setShippingCost(data.shippingFee);
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch shipping cost. Using default value.",
                duration: 3000,
                variant: "destructive",
            });
        }
    }, [error, toast]); // Add only stable dependencies

    useEffect(() => {
        calculateSubtotal(cart);
        fetchShippingCost(); // Now fetchShippingCost is stable
    }, [cart, fetchShippingCost]); // Now it's safe to include

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setShippingAddress((prev) => ({ ...prev, [name]: value }))
    }

    const handleCouponApply = async () => {
        setIsLoading(true)
        setError(null)
        const previousDiscount = discount
        const previousCouponCode = couponCode
        try {
            const response = await fetch(`${API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: couponCode,
                    cartTotal: subtotal,
                }),
                credentials: "include",
            })
            const data = await response.json()

            if (data.success) {
                setDiscount(data.data.discount)
                setTotal(subtotal + shippingCost - data.data.discount)
                toast({
                    title: "Coupon applied!",
                    description: `You saved Rs ${data.data.discount.toFixed(2)}`,
                    duration: 3000,
                })
                setCouponCode(data.data.code)
            } else {
                setError(data.message)
                toast({
                    title: "Coupon Rejected!",
                    description: data.message,
                    duration: 3000,
                    variant: "destructive",
                })
                setDiscount(previousDiscount)
                setCouponCode(previousCouponCode)
                setTotal(subtotal + shippingCost - previousDiscount)
            }
        } catch (error) {
            toast({
                title: "Coupon Rejected!",
                description: `${error}`,
                duration: 3000,
            })
            setError("Failed to apply coupon. Please try again.")
            setDiscount(previousDiscount)
            setCouponCode(previousCouponCode)
            setTotal(subtotal + shippingCost - previousDiscount)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (
                !shippingAddress.fullName ||
                !shippingAddress.address ||
                !shippingAddress.city ||
                !shippingAddress.postalCode ||
                !shippingAddress.country ||
                !shippingAddress.email ||
                !shippingAddress.phone
            ) {
                setError("All shipping address fields are required.")
                toast({
                    title: "Validation Error",
                    description: "Please fill in all the required fields.",
                    duration: 3000,
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            const orderData = {
                items: cart.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                },
                paymentMethod,
                couponCode: couponCode || undefined,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                name: shippingAddress.fullName,
                subtotal: subtotal,
                shippingCost: shippingCost,
                discount: discount,
                totalAmount: total,
            }

            const response = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
                credentials: "include",
            })

            const data = await response.json()

            if (data.success) {
                if (paymentMethod === "PayFast" && data.data.paymentResult?.redirectUrl) {
                    window.location.href = data.data.paymentResult.redirectUrl
                } else if (paymentMethod === "COD") {
                    clearCart()
                    router.push("/user/order-success")
                }
            } else {
                setError(data.message || "Failed to place order. Please try again.")
                toast({
                    title: "Order Rejected!",
                    description: `${data.message}`,
                    duration: 3000,
                })
            }
        } catch (error) {
            toast({
                title: "Order Rejected!",
                description: `${error}`,
                duration: 3000,
            })
            setError("An unexpected error occurred. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={shippingAddress.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={shippingAddress.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={shippingAddress.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={shippingAddress.postalCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={shippingAddress.country}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mt-6">
                                    <Label>Payment Method</Label>
                                    <div className="space-y-2 mt-2">
                                        {/* <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="payfast"
                                                name="paymentMethod"
                                                value="PayFast"
                                                checked={paymentMethod === "PayFast"}
                                                onChange={(e) => setPaymentMethod(e.target.value as "PayFast" | "COD")}
                                                className="form-radio"
                                            />
                                            <Label htmlFor="payfast">PayFast</Label>
                                        </div> */}
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="cod"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={paymentMethod === "COD"}
                                                onChange={(e) => setPaymentMethod(e.target.value as "PayFast" | "COD")}
                                                className="form-radio"
                                            />
                                            <Label htmlFor="cod">Cash on Delivery</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSubmit} disabled={isLoading || cart.length === 0}>
                            {isLoading ? "Processing..." : "Place Order"}
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Image
                                            src={item.image || "/placeholder.svg"}
                                            alt={item.name}
                                            width={50}
                                            height={50}
                                            className="rounded-md mr-4"
                                        />
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rs {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Rs {shippingCost.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-Rs {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>Rs {total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Label htmlFor="coupon">Coupon Code</Label>
                            <div className="flex mt-1">
                                <Input
                                    type="text"
                                    id="coupon"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter coupon code"
                                    className="mr-2"
                                />
                                <Button onClick={handleCouponApply} variant="outline" disabled={isLoading}>
                                    {isLoading ? "Applying..." : "Apply"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

