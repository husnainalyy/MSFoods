"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SalesStats {
    _id: null
    totalOrders: number
    couponsUsed: number
    totalSales: number
    totalShippingCost: number
    totalRevenue: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function Sales() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [salesStats, setSalesStats] = useState<SalesStats | null>(null)
    const [timeRange, setTimeRange] = useState("week")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchSalesStats = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const queryParams = new URLSearchParams()

            if (timeRange === "custom" && startDate && endDate) {
                queryParams.append("startDate", startDate)
                queryParams.append("endDate", endDate)
            } else {
                queryParams.append("period", timeRange)
            }

            const response = await fetch(`${API_URL}/api/orders/sales?${queryParams}`, {
                credentials: "include",
            })

            if (!response.ok) {
              
                toast({
                    title: "Error",
                    description: "Failed to fetch sales stats",
                    variant: "destructive",
                })
            }
            const data = await response.json()
            setSalesStats(data.data)
        } catch {
            
            setError("Failed to load sales data. Please try again later.")
            toast({
                title: "Error",
                description: "Failed to load sales data. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [timeRange, startDate, endDate, toast])

    useEffect(() => {
        if (timeRange !== "custom" || (timeRange === "custom" && startDate && endDate)) {
            fetchSalesStats()
        }
    }, [fetchSalesStats, timeRange, startDate, endDate])

    const chartData = [
        { name: "Sales", value: salesStats?.totalSales || 0 },
        { name: "Shipping", value: salesStats?.totalShippingCost || 0 },
        { name: "Revenue", value: salesStats?.totalRevenue || 0 },
    ]

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex flex-col items-center justify-center">
                <Loader className="animate-spin h-8 w-8 mb-4" />
                <p>Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-10 flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Sales Overview</h1>
            <div className="mb-5 flex items-center gap-4">
                <Select onValueChange={(value) => setTimeRange(value)} defaultValue={timeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>
                {timeRange === "custom" && (
                    <>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded p-2"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded p-2"
                        />
                        <button onClick={fetchSalesStats} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Apply
                        </button>
                    </>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {salesStats?.totalRevenue.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats?.totalOrders || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {salesStats?.totalSales.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coupons Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats?.couponsUsed || 0}</div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Sales Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}