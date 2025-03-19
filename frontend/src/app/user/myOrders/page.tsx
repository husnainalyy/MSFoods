"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/app/Component/UserContext"
import { Loader2, ChevronDown, ChevronUp, Package, ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ReviewModal from "./ReviewModal"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import { useRouter } from "next/navigation"  // Import useRouter



interface OrderItem {
    product: {
        _id: string
        name: string
        images: Array<{ url: string }>
    }
    name: string
    quantity: number
    price: number
    image: string
    _id: string
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

interface Order {
    _id: string
    createdAt: string
    totalAmount: number
    status: string
    items: OrderItem[]
    shippingAddress: ShippingAddress
    paymentMethod: string
    trackingId?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"


export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [openCollapsibles, setOpenCollapsibles] = useState<{ [key: string]: boolean }>({})
    const { user } = useUser()
    const { toast } = useToast()
    const router = useRouter();  // Initialize router

    useEffect(() => {
        if (!user) {
            setLoading(false);  // Prevent infinite loading
            router.push("/auth/login"); // Redirect to login page
            return;
        }
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/api/orders/my-orders`, {
                    credentials: "include",
                })
                if (!response.ok) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch orders",
                        variant: "destructive",
                    })
                }
                const data = await response.json()
                setOrders(data.data)
            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load orders. Please try again.",
                })
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchOrders()
    }, [user, toast, router])

    const handleReviewClick = (order: Order) => {
        setSelectedOrder(order)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "processing":
                return "bg-blue-500"
            case "shipped":
                return "bg-yellow-500"
            case "delivered":
                return "bg-green-500"
            case "cancelled":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    const toggleCollapsible = (orderId: string) => {
        setOpenCollapsibles((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }))
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            
            {orders && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
                    <p className="text-gray-500 mb-4">You have not placed any orders yet.</p>
                    <Button onClick={() => router.push("/")}>Start Shopping</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order._id} className="mb-4">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
                                    <Badge className={`${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p>{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p>Rs {order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <p>{order.paymentMethod}</p>
                                    </div>
                                    {order.trackingId && (
                                        <div>
                                            <p className="text-sm text-gray-500">Tracking ID</p>
                                            <p>{order.trackingId}</p>
                                        </div>
                                    )}
                                </div>

                                <Collapsible
                                    open={openCollapsibles[order._id]}
                                    onOpenChange={() => toggleCollapsible(order._id)}
                                    className="mt-4"
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            {openCollapsibles[order._id] ? (
                                                <ChevronUp className="h-4 w-4 mr-2" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 mr-2" />
                                            )}
                                            {openCollapsibles[order._id] ? "Hide Details" : "Show Details"}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Shipping Address</h4>
                                                <p>{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.address}</p>
                                                <p>
                                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                                </p>
                                                <p>{order.shippingAddress.country}</p>
                                                <p>Phone: {order.shippingAddress.phone}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Order Items</h4>
                                                {order.items.map((item) => (
                                                    <div key={item._id} className="flex items-center space-x-4 mb-2">
                                                        <Image
                                                            src={item.image || "/placeholder.svg"}
                                                            alt={item.name}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="text-sm text-gray-500">
                                                                Quantity: {item.quantity} | Price: Rs {item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handleReviewClick(order)} className="w-full">
                                    <Package className="mr-2 h-4 w-4" /> Leave Reviews
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            {selectedOrder && <ReviewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    )
}

