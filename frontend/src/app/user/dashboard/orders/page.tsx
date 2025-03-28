"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Search,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "../../../Component/user-context"
import Cookies from "js-cookie"

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    filterOrders(activeTab, searchQuery)
  }, [orders, activeTab, searchQuery])
  useEffect(() => {
    fetchOrders()
  }, [])
  
  // Update the fetchOrders function to use the token from the user object
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const token = user?.accessToken || localStorage.getItem("accessToken") || Cookies.get("accessToken")

      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Filter to only show delivered orders as per requirements
        const deliveredOrders = data.data.filter((order: Order) => order.status === "Delivered")
        setOrders(deliveredOrders)
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)

    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = (status: string, query: string) => {
    let filtered = [...orders]

    // Filter by status if not "all"
    if (status !== "all") {
      filtered = filtered.filter((order) => {
        if (status === "recent") {
          // Show orders from the last 30 days
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return new Date(order.createdAt) >= thirtyDaysAgo
        }
        return true
      })
    }

    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(lowercaseQuery) ||
          order.items.some((item) => item.name.toLowerCase().includes(lowercaseQuery)),
      )
    }

    setFilteredOrders(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
        return "bg-orange-100 text-orange-500"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            All Orders
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">{orders.length}</span>
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent (30 days)
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
              {
                orders.filter((o) => {
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return new Date(o.createdAt) >= thirtyDaysAgo
                }).length
              }
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No orders match your search criteria" : "You don't have any completed orders yet"}
              </p>
              <Button onClick={() => router.push("/")} variant="outline">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-base font-medium">
                          Order #{order._id}
                        </CardTitle>
                        <CardDescription>
                          Delivered on {order.deliveredAt ? formatDate(order.deliveredAt) : formatDate(order.updatedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/user/dashboard/orders/${order._id}`)}
                        >
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                              <img
                                src={item.image || "/placeholder.svg?height=80&width=80"}
                                alt={item.name}
                                className="object-cover h-full w-full"
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                                <span>Qty: {item.quantity}</span>
                                <span>
                                  {item.priceOption.type === "packet" ? "Packet" : `${item.priceOption.weight}g`}
                                </span>
                                <span>
                                  {item.priceOption.salePrice ? (
                                    <>
                                      <span className="line-through mr-1">Rs. {item.priceOption.price.toFixed(2)}</span>
                                      <span className="text-red-500">Rs. {item.priceOption.salePrice.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    `Rs. ${item.priceOption.price.toFixed(2)}`
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500 italic">+ {order.items.length - 2} more item(s)</div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"} total
                        </div>
                        <div className="font-medium">Total: Rs. {order.totalAmount.toFixed(2)}</div>
                      </div>

                      {/* Tracking Info (if available) */}
                      {order.trackingId && (
                        <div className="flex items-center gap-2 pt-3 border-t text-sm">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Tracking:</span>
                          <span className="font-medium">{order.trackingId}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

