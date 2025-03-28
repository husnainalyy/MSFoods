"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Eye, Search, Truck, Download, FileText, Printer, Package, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { authFetch } from "@/app/utils/auth-helpers"
import { useReactToPrint } from "react-to-print"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import "jspdf-autotable"

interface OrderItem {
    product: string
    name: string
    quantity: number
    image?: string
    priceOption: {
        type: "packet" | "weight-based"
        weight?: number
        price: number
        salePrice?: number
    }
    _id: string
    id: string
}

interface Order {
    _id: string
    user: {
        name: string
        email: string
    } | null
    totalAmount: number
    subtotal: number
    shippingCost: number
    discount: number
    status: string
    createdAt: string
    items: OrderItem[]
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
    deliveredAt?: string
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function Orders() {
    const { toast } = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("10")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [pendingUpdate, setPendingUpdate] = useState<{ orderId: string; status: string; trackingId: string } | null>(
        null,
    )
    const [isLoading, setIsLoading] = useState(true)
    const orderDetailsRef = useRef<HTMLDivElement>(null)

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await authFetch(
                `${API_URL}/api/orders?page=${currentPage}&limit=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ""
                }${statusFilter ? `&status=${statusFilter}` : ""}`,
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to fetch orders")
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch orders")
            }

            setOrders(data.data.orders || [])
            setTotalPages(data.data.totalPages || 1)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error fetching orders",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, toast])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleStatusChange = (orderId: string, newStatus: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order) {
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
            setPendingUpdate({
                orderId,
                status: pendingUpdate?.status || order.status,
                trackingId,
            })
        }
    }

    const confirmUpdate = (orderId: string) => {
        const order = orders.find((o) => o._id === orderId)
        if (order) {
            setPendingUpdate({
                orderId,
                status: pendingUpdate?.status || order.status,
                trackingId: pendingUpdate?.trackingId || order.trackingId || "",
            })
            setIsConfirmDialogOpen(true)
        }
    }

    const handlePrint = useReactToPrint({
        content: () => orderDetailsRef.current,
        documentTitle: `Order-${currentOrder?._id}`,
        onBeforePrint: () => {
            console.log("Print content:", orderDetailsRef.current)
        },
        removeAfterPrint: true,
    })

    const submitUpdate = async () => {
        if (!pendingUpdate) return

        try {
            // Format the status to lowercase as required by the API
            const status = pendingUpdate.status.toLowerCase()

            // Create the request body with the properly formatted status
            const requestBody = {
                status: status,
                trackingId: pendingUpdate.trackingId || "",
            }

            console.log("Sending update with data:", requestBody)

            const response = await authFetch(`${API_URL}/api/orders/${pendingUpdate.orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to update order")
            }

            fetchOrders()
            toast({
                title: "Order Updated",
                description: `Order status changed to ${pendingUpdate.status}${pendingUpdate.trackingId ? ` with tracking ID ${pendingUpdate.trackingId}` : ""
                    }.`,
            })
        } catch (error) {
            console.error("Error updating order:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update order status",
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

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(value)
        setCurrentPage(1)
    }

    // Format product name with type and weight information
    const formatProductName = (item: OrderItem) => {
        const productType = item.priceOption.type
        const weight = item.priceOption.weight

        if (productType === "weight-based" && weight) {
            return `${item.name} (${weight}g)`
        } else if (productType === "packet") {
            return `${item.name} (Packet)`
        }
        return item.name
    }

    const generatePDF = () => {
        if (!currentOrder) return

        const doc = new jsPDF()

        // Add company logo/header
        doc.setFontSize(20)
        doc.text("Order Invoice", 105, 15, { align: "center" })

        // Order details
        doc.setFontSize(12)
        doc.text(`Order ID: ${currentOrder._id}`, 14, 30)
        doc.text(`Date: ${new Date(currentOrder.createdAt).toLocaleDateString()}`, 14, 37)
        doc.text(`Status: ${currentOrder.status}`, 14, 44)

        // Customer details
        doc.text("Customer Information:", 14, 55)
        doc.text(`Name: ${currentOrder.shippingAddress.fullName}`, 14, 62)
        doc.text(`Email: ${currentOrder.shippingAddress.email}`, 14, 69)
        doc.text(`Phone: ${currentOrder.shippingAddress.phone}`, 14, 76)

        // Shipping address
        doc.text("Shipping Address:", 120, 55)
        doc.text(`${currentOrder.shippingAddress.address}`, 120, 62)
        doc.text(`${currentOrder.shippingAddress.city}, ${currentOrder.shippingAddress.postalCode}`, 120, 69)
        doc.text(`${currentOrder.shippingAddress.country}`, 120, 76)

        // Order items table with product type information
        const tableColumn = ["Product", "Type", "Quantity", "Price", "Total"]
        const tableRows = currentOrder.items.map((item) => [
            item.name,
            item.priceOption.type === "weight-based" ? `Weight (${item.priceOption.weight}g)` : "Packet",
            item.quantity.toString(),
            `$${item.priceOption?.price ? item.priceOption.price.toFixed(2) : "0.00"}`,
            `$${item.priceOption?.price ? (item.quantity * item.priceOption.price).toFixed(2) : "0.00"}`,
        ])

        // Use autoTable directly
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [66, 66, 66] },
        })

        // Get the y position after the table
        const finalY = (doc as any).lastAutoTable.finalY || 120

        // Order summary
        doc.text("Order Summary:", 14, finalY + 10)
        doc.text(`Subtotal: $${currentOrder.subtotal.toFixed(2)}`, 14, finalY + 17)
        doc.text(`Shipping: $${currentOrder.shippingCost.toFixed(2)}`, 14, finalY + 24)
        doc.text(`Discount: $${currentOrder.discount.toFixed(2)}`, 14, finalY + 31)
        doc.text(`Total: $${currentOrder.totalAmount.toFixed(2)}`, 14, finalY + 38)

        // Payment information
        doc.text(`Payment Method: ${currentOrder.paymentMethod}`, 120, finalY + 10)
        if (currentOrder.trackingId) {
            doc.text(`Tracking ID: ${currentOrder.trackingId}`, 120, finalY + 17)
        }

        // Footer
        doc.setFontSize(10)
        doc.text("Thank you for your order!", 105, finalY + 50, { align: "center" })

        // Save the PDF
        doc.save(`Order-${currentOrder._id}.pdf`)
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "Processing":
                return "bg-blue-100 text-blue-800"
            case "Shipped":
                return "bg-yellow-100 text-yellow-800"
            case "Delivered":
                return "bg-green-100 text-green-800"
            case "Cancelled":
                return "bg-red-100 text-red-800"
            case "Returned":
                return "bg-purple-100 text-purple-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Toaster />
            <h1 className="text-2xl font-bold mb-5">Orders Management</h1>

            <div className="mb-5 flex flex-col md:flex-row gap-4">
                <div className="flex items-center flex-1 gap-2">
                    <Input className="max-w-sm" placeholder="Search orders..." value={searchTerm} onChange={handleSearch} />
                    <Button onClick={() => fetchOrders()}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
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

                    <Select value={itemsPerPage} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-10 border rounded-md">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No orders found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-hidden">
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
                                    <TableCell className="font-medium">{order._id.substring(0, 8)}...</TableCell>
                                    <TableCell>{order.user ? order.user.name : order.shippingAddress.fullName}</TableCell>
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
                                                    <SelectItem value="Returned">Returned</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="outline" size="icon" onClick={() => confirmUpdate(order._id)}>
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
                                            <DialogContent className="max-w-4xl max-h-[90vh]">
                                                <DialogHeader>
                                                    <DialogTitle className="flex justify-between items-center">
                                                        <span>Order Details</span>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                                                <Printer className="h-4 w-4 mr-2" />
                                                                Print
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={generatePDF}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download PDF
                                                            </Button>
                                                        </div>
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="overflow-auto max-h-[calc(90vh-120px)]">
                                                    {currentOrder && (
                                                        <div id="printable-content" ref={orderDetailsRef} className="p-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Order Information</CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        <div className="space-y-2">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Order ID:</span>
                                                                                <span className="font-medium">{currentOrder._id}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Customer:</span>
                                                                                <span className="font-medium">
                                                                                    {currentOrder.user
                                                                                        ? currentOrder.user.name
                                                                                        : currentOrder.shippingAddress.fullName}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Email:</span>
                                                                                <span className="font-medium">
                                                                                    {currentOrder.user
                                                                                        ? currentOrder.user.email
                                                                                        : currentOrder.shippingAddress.email}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Date:</span>
                                                                                <span className="font-medium">
                                                                                    {new Date(currentOrder.createdAt).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Payment Method:</span>
                                                                                <span className="font-medium">{currentOrder.paymentMethod}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-muted-foreground">Status:</span>
                                                                                <Badge className={getStatusBadgeColor(currentOrder.status)}>
                                                                                    {currentOrder.status}
                                                                                </Badge>
                                                                            </div>
                                                                            {currentOrder.trackingId && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground">Tracking ID:</span>
                                                                                    <span className="font-medium">{currentOrder.trackingId}</span>
                                                                                </div>
                                                                            )}
                                                                            {currentOrder.deliveredAt && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground">Delivered At:</span>
                                                                                    <span className="font-medium">
                                                                                        {new Date(currentOrder.deliveredAt).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Shipping Address</CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent>
                                                                        <div className="space-y-2">
                                                                            <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                                                                            <p>{currentOrder.shippingAddress.address}</p>
                                                                            <p>
                                                                                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.postalCode}
                                                                            </p>
                                                                            <p>{currentOrder.shippingAddress.country}</p>
                                                                            <p>Phone: {currentOrder.shippingAddress.phone}</p>
                                                                            <p>Email: {currentOrder.shippingAddress.email}</p>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                            <Card className="mb-6">
                                                                <CardHeader>
                                                                    <CardTitle>Order Items</CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Product</TableHead>
                                                                                <TableHead>Type</TableHead>
                                                                                <TableHead>Quantity</TableHead>
                                                                                <TableHead>Price</TableHead>
                                                                                <TableHead>Total</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {currentOrder.items.map((item, index) => (
                                                                                <TableRow key={index}>
                                                                                    <TableCell>
                                                                                        <div className="flex items-center gap-3">
                                                                                            {item.image && (
                                                                                                <img
                                                                                                    src={item.image || "/placeholder.svg"}
                                                                                                    alt={item.name}
                                                                                                    className="w-10 h-10 object-cover rounded-md"
                                                                                                />
                                                                                            )}
                                                                                            <div>
                                                                                                <div className="font-medium">{item.name}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <div className="flex items-center gap-1">
                                                                                            {item.priceOption.type === "weight-based" ? (
                                                                                                <>
                                                                                                    <Scale className="h-4 w-4 text-gray-500" />
                                                                                                    <span className="font-medium">
                                                                                                        Weight ({item.priceOption.weight}g)
                                                                                                    </span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Package className="h-4 w-4 text-gray-500" />
                                                                                                    <span className="font-medium">Packet</span>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell>{item.quantity}</TableCell>
                                                                                    <TableCell>
                                                                                        ${item.priceOption?.price ? item.priceOption.price.toFixed(2) : "0.00"}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        $
                                                                                        {item.priceOption?.price
                                                                                            ? (item.quantity * item.priceOption.price).toFixed(2)
                                                                                            : "0.00"}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </CardContent>
                                                            </Card>
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle>Order Summary</CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Subtotal:</span>
                                                                            <span>${currentOrder.subtotal.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Shipping:</span>
                                                                            <span>${currentOrder.shippingCost.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Discount:</span>
                                                                            <span>-${currentOrder.discount.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                                            <span>Total:</span>
                                                                            <span>${currentOrder.totalAmount.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    Showing {orders.length} of {totalPages * Number.parseInt(itemsPerPage)} orders
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
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

