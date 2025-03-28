"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  MapPin,
  CreditCard,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "../../../../Component/user-context"
import Cookies from "js-cookie"
import { ReviewDialog } from "@/components/review-dialog" // Import ReviewDialog component

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

interface OrderItem {
  product: {
    _id: string
    name: string
  }
  name: string
  priceOption: {
    type: string
    weight: number
    price: number
    salePrice?: number | null
  }
  quantity: number
  image: string
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
  user: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discount: number
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: "COD" | "PayFast"
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned"
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  trackingId?: string
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  // Add state for review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string
    name: string
    orderId: string
  }>({
    id: "",
    name: "",
    orderId: "",
  })

  useEffect(() => {
    fetchOrderDetails()
  }, [])

  // Add function to open review dialog
  const openReviewDialog = (productId: string, productName: string, orderId: string) => {
    setSelectedProduct({
      id: productId,
      name: productName,
      orderId,
    })
    setReviewDialogOpen(true)
  }

  // Update the fetchOrderDetails function to match your API response format
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()

      if (data.success && data.data) {
        setOrder(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <RefreshCw className="h-5 w-5 text-blue-500" />
      case "Shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "Returned":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Shipped":
        return "bg-purple-100 text-purple-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Returned":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 md:col-span-2" />
          <Skeleton className="h-32" />
        </div>

        <Skeleton className="h-64" />

        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Order not found</h3>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Button onClick={() => router.push("/user/dashboard/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0 h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle>Order #{order._id}</CardTitle>
                <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.status)} px-3 py-1.5`}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Timeline */}
              <div className="space-y-2">
                <h3 className="font-medium">Order Timeline</h3>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  <div className="relative">
                    <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-green-500"></div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>

                  {order.status !== "Cancelled" && (
                    <div className="relative">
                      <div
                        className={`absolute -left-[25px] h-4 w-4 rounded-full ${order.status === "Processing" || order.status === "Shipped" || order.status === "Delivered" ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      <p className="text-sm font-medium">Processing</p>
                      <p className="text-xs text-gray-500">
                        {order.status === "Processing" || order.status === "Shipped" || order.status === "Delivered"
                          ? formatDate(order.updatedAt)
                          : "Pending"}
                      </p>
                    </div>
                  )}

                  {order.status !== "Cancelled" && order.status !== "Processing" && (
                    <div className="relative">
                      <div
                        className={`absolute -left-[25px] h-4 w-4 rounded-full ${order.status === "Shipped" || order.status === "Delivered" ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      <p className="text-sm font-medium">Shipped</p>
                      <p className="text-xs text-gray-500">
                        {order.status === "Shipped" || order.status === "Delivered"
                          ? formatDate(order.updatedAt)
                          : "Pending"}
                      </p>
                    </div>
                  )}

                  {order.status === "Delivered" && (
                    <div className="relative">
                      <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-green-500"></div>
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-gray-500">{formatDate(order.deliveredAt || order.updatedAt)}</p>
                    </div>
                  )}

                  {order.status === "Cancelled" && (
                    <div className="relative">
                      <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-red-500"></div>
                      <p className="text-sm font-medium">Cancelled</p>
                      <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  )}

                  {order.status === "Returned" && (
                    <div className="relative">
                      <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-orange-500"></div>
                      <p className="text-sm font-medium">Returned</p>
                      <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingId && (order.status === "Shipped" || order.status === "Delivered") && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-gray-700" />
                    <h3 className="font-medium">Tracking Information</h3>
                  </div>
                  <div className="mt-2 pl-7">
                    <p className="text-sm">
                      Tracking ID: <span className="font-medium">{order.trackingId}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can track your package using the tracking ID above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Order Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={() => router.push("/user/dashboard/orders")}>
              View All Orders
            </Button>

            {order.status === "Processing" && (
              <Button
                variant="outline"
                className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  toast({
                    title: "Request sent",
                    description: "Your cancellation request has been submitted.",
                  })
                }}
              >
                Request Cancellation
              </Button>
            )}

            {order.status === "Delivered" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Support contacted",
                    description: "Our team will contact you shortly regarding your return request.",
                  })
                }}
              >
                Request Return
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="h-24 w-24 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                  <img
                    src={item.image || "/placeholder.svg?height=120&width=120"}
                    alt={item.name}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 mt-1">
                    <span>Qty: {item.quantity}</span>
                    <span>{item.priceOption.type === "packet" ? "Packet" : `${item.priceOption.weight}g`}</span>
                  </div>
                  <div className="mt-2">
                    {item.priceOption.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500">Rs. {item.priceOption.price.toFixed(2)}</span>
                        <span className="text-red-500 font-medium">Rs. {item.priceOption.salePrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">Rs. {item.priceOption.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Item Total: Rs.{" "}
                    {((item.priceOption.salePrice || item.priceOption.price) * item.quantity).toFixed(2)}
                  </div>

                  {/* Add review button for each product */}
                  {order.status === "Delivered" && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs flex items-center gap-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        onClick={() => openReviewDialog(item.product._id, item.name, order._id)}
                      >
                        <Star className="h-3.5 w-3.5" />
                        Write Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">{order.shippingAddress.fullName}</h4>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  <div className="mt-2 text-sm">
                    <p>{order.shippingAddress.email}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Payment Method</h4>
                  <p className="text-gray-600">{order.paymentMethod === "COD" ? "Cash on Delivery" : "PayFast"}</p>

                  <div className="mt-4">
                    <h4 className="font-medium">Order Summary</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>Rs. {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span>Rs. {order.shippingCost.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-red-500">-Rs. {order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>Rs. {order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add ReviewDialog component */}
      <ReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        productId={selectedProduct.id}
        productName={selectedProduct.name}
        orderId={selectedProduct.orderId}
        onReviewSubmitted={fetchOrderDetails}
      />
    </div>
  )
}

