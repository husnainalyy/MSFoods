"use client"

import { useState, useEffect, useCallback } from "react"
import { Eye, Search, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Order {
    _id: string
    user: {
        name: string
        email: string
    } | null
    totalAmount: number
    status: string
    createdAt: string
    items: Array<{
        name: string
        quantity: number
        price: number
    }>
    shippingAddress: {
        fullName: string
        address: string
        city: string
        postalCode: string
        country: string
        email: string
        phone: string
    }
    paymentMethod: string
    trackingId?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function Orders() {
    const { toast } = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pendingUpdate, setPendingUpdate] = useState<{ orderId: string; status: string; trackingId: string } | null>(
        null,
    )

    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/orders?page=${currentPage}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
                {
                    credentials: "include",
                },
            )
            const data = await response.json()
            if (!data.success) {
                toast({
                    title: "Error",
                    description: "Error fetching orders: " + data.message,
                    variant: "destructive",
                })
                return // Stop execution to prevent accessing undefined data.data
            }

            setOrders(data.data.orders || []) // Ensure it's an array
            setTotalPages(data.data.totalPages || 1)
        } catch (error) {
            toast({
                title: "Error",
                description: "Error fetching orders: " + error,
                variant: "destructive",
            })
        }
    }, [currentPage, searchTerm, toast])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleStatusChange = (orderId: string, newStatus: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order) {
            console.log("Order status changed to", newStatus)
            setPendingUpdate({
                orderId,
                status: newStatus,
                trackingId: pendingUpdate ? pendingUpdate.trackingId || order.trackingId || "" : order.trackingId || "",
            })
            setIsConfirmDialogOpen(true)
        }
    }

    const handleTrackingIdChange = (orderId: string, trackingId: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order) {
            setPendingUpdate({ orderId, status: order.status, trackingId })
        }
    }

    const confirmUpdate = (orderId: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order) {
            setPendingUpdate({
                orderId,
                status: order.status,
                trackingId: pendingUpdate?.trackingId || order.trackingId || "",
            })
            setIsConfirmDialogOpen(true)
        }
    }

    const confirmStatusUpdate = (orderId: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order && pendingUpdate?.orderId === orderId) {
            setIsConfirmDialogOpen(true)
        }
    }

    const submitUpdate = async () => {
        if (!pendingUpdate) return

        try {
            const response = await fetch(`${API_URL}/api/orders/${pendingUpdate.orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: pendingUpdate.status, trackingId: pendingUpdate.trackingId }),
                credentials: "include",
            })
            if (response.ok) {
                fetchOrders()
                toast({
                    title: "Order Updated",
                    description: `Order status changed to ${pendingUpdate.status}${pendingUpdate.trackingId ? ` with tracking ID ${pendingUpdate.trackingId}` : ""}.`,
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update order",
                    variant: "destructive",
                })
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to update order status. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsConfirmDialogOpen(false)
            setPendingUpdate(null)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    return (
        <div className="container mx-auto py-10">
            <Toaster />
            <h1 className="text-2xl font-bold mb-5">Orders</h1>
            <div className="mb-5 flex items-center">
                <Input className="max-w-sm mr-2" placeholder="Search orders..." value={searchTerm} onChange={handleSearch} />
                <Button onClick={() => fetchOrders()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order._id}>
                            <TableCell>{order._id}</TableCell>
                            <TableCell>{order.user ? order.user.name : "Guest"}</TableCell>
                            <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Select
                                        value={pendingUpdate?.orderId === order._id ? pendingUpdate.status : order.status}
                                        onValueChange={(value) => handleStatusChange(order._id, value)}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Shipped">Shipped</SelectItem>
                                            <SelectItem value="Delivered">Delivered</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => confirmStatusUpdate(order._id)}>
                                        <Truck className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        placeholder="Tracking ID"
                                        value={pendingUpdate?.orderId === order._id ? pendingUpdate.trackingId : order.trackingId || ""}
                                        onChange={(e) => handleTrackingIdChange(order._id, e.target.value)}
                                        className="w-[150px]"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => confirmUpdate(order._id)}>
                                        <Truck className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Dialog>
                                   
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => setCurrentOrder(order)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>Order Details</DialogTitle>
                                        </DialogHeader>
                                        {currentOrder && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Order Information</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>Order ID: {currentOrder._id}</p>
                                                        <p>Customer: {currentOrder.user ? currentOrder.user.name : "Guest"}</p>
                                                        <p>
                                                            Email: {currentOrder.user ? currentOrder.user.email : currentOrder.shippingAddress.email}
                                                        </p>
                                                        <p>Total Amount: ${currentOrder.totalAmount.toFixed(2)}</p>
                                                        <p>Status: {currentOrder.status}</p>
                                                        <p>Date: {new Date(currentOrder.createdAt).toLocaleString()}</p>
                                                        <p>Payment Method: {currentOrder.paymentMethod}</p>
                                                        <p>Tracking ID: {currentOrder.trackingId || "Not available"}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Shipping Address</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p>{currentOrder.shippingAddress.fullName}</p>
                                                        <p>{currentOrder.shippingAddress.address}</p>
                                                        <p>
                                                            {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.postalCode}
                                                        </p>
                                                        <p>{currentOrder.shippingAddress.country}</p>
                                                        <p>Phone: {currentOrder.shippingAddress.phone}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="col-span-2">
                                                    <CardHeader>
                                                        <CardTitle>Order Items</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Product</TableHead>
                                                                    <TableHead>Quantity</TableHead>
                                                                    <TableHead>Price</TableHead>
                                                                    <TableHead>Total</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {currentOrder.items.map((item, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>{item.name}</TableCell>
                                                                        <TableCell>{item.quantity}</TableCell>
                                                                        <TableCell>${item.price.toFixed(2)}</TableCell>
                                                                        <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="mt-4 flex justify-between items-center">
                <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Order Update</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to update this order?</p>
                    {pendingUpdate && (
                        <>
                            <p>New Status: {pendingUpdate.status}</p>
                            {pendingUpdate.trackingId && <p>New Tracking ID: {pendingUpdate.trackingId}</p>}
                        </>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitUpdate}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

