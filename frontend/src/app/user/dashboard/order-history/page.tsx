"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Calendar,
  ChevronRight,
  Download,
  Search,
  ShoppingBag,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const { user } = useUser()
  const router = useRouter()
  useEffect(() => {
    fetchOrders()
  }, [])
  

  useEffect(() => {
    filterAndSortOrders()
  }, [orders, searchQuery, timeFilter, statusFilter, sortOrder])

  // Update the fetchOrders function to match your API response format
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
        throw new Error("Failed to fetch order history")
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Show all orders for order history
        setOrders(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch order history")
      }
    } catch (error) {
      console.error("Error fetching order history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortOrders = () => {
    let filtered = [...orders]

    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(lowercaseQuery) ||
          order.items.some((item) => item.name.toLowerCase().includes(lowercaseQuery)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply time filter
    const now = new Date()
    if (timeFilter === "last30days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((order) => new Date(order.createdAt) >= thirtyDaysAgo)
    } else if (timeFilter === "last6months") {
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((order) => new Date(order.createdAt) >= sixMonthsAgo)
    } else if (timeFilter === "lastyear") {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((order) => new Date(order.createdAt) >= oneYearAgo)
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortOrder === "highestAmount") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount)
    } else if (sortOrder === "lowestAmount") {
      filtered.sort((a, b) => a.totalAmount - b.totalAmount)
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
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-full sm:w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order History</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highestAmount">Highest Amount</SelectItem>
              <SelectItem value="lowestAmount">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "No orders match your search criteria" : "You don't have any orders yet"}
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="py-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-base font-medium">Order #{order._id}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(order.createdAt)}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </span>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/user/dashboard/orders/${order._id}`)}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg?height=40&width=40"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 sm:mt-0">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="font-medium">Rs. {order.totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

