"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

interface Coupon {
    _id: string
    code: string
    discountType: "percentage" | "fixed"
    discountValue: number
    minPurchase: number
    maxPurchase?: number
    totalCoupons: number
    usedCoupons: number
    maxUsesPerUser: number
    startAt: string
    expiresAt: string
    isActive: boolean
    eligibleUsers?: string[]
    usedBy?: string[]
}

interface User {
    _id: string
    name: string
    email?: string
    phone?: string
}

function isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
}

export default function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [eligibleUserIds, setEligibleUserIds] = useState<string[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [contactType, setContactType] = useState<"email" | "phone">("email")
    const { toast } = useToast()

    // Reset eligible users when dialogs close
    useEffect(() => {
        if (!isAddDialogOpen && !isEditDialogOpen) {
            setEligibleUserIds([])
            setSelectedUserIds([])
        }
    }, [isAddDialogOpen, isEditDialogOpen])

    // Set eligible users when editing a coupon
    useEffect(() => {
        if (currentCoupon && isEditDialogOpen) {
            setEligibleUserIds(currentCoupon.eligibleUsers || [])
        }
    }, [currentCoupon, isEditDialogOpen])

    // Fetch users when dialog opens
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("accessToken")

                const response = await fetch(`${API_URL}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch users")
                }

                const data = await response.json()
                setUsers(data.data.users)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load users",
                })
            }
        }

        if (isAddDialogOpen || isEditDialogOpen) {
            fetchUsers()
        }
    }, [isAddDialogOpen, isEditDialogOpen, toast])

    // Fetch coupons
    const fetchCoupons = useCallback(async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/coupons/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch coupons")
            }

            const data = await response.json()
            setCoupons(data.data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch coupons",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchCoupons()
    }, [fetchCoupons])

    // Filter users based on search term and contact type
    const filteredUsers = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase()

        // First filter by contact type
        if (contactType === "email" && !user.email) return false
        if (contactType === "phone" && !user.phone) return false

        // Then filter by search term
        if (!searchTerm) return true

        return (
            user.name.toLowerCase().includes(searchLower) ||
            (contactType === "email" && user.email?.toLowerCase().includes(searchLower)) ||
            (contactType === "phone" && user.phone?.toLowerCase().includes(searchLower))
        )
    })

    // Toggle user selection in the temporary selection list
    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    }

    // Add selected users to eligible users
    const addSelectedUsersToEligible = () => {
        setEligibleUserIds((prev) => {
            // Filter out users that are already in the eligible list
            const newUsers = selectedUserIds.filter((id) => !prev.includes(id))
            return [...prev, ...newUsers]
        })
        setSelectedUserIds([])
    }

    // Remove a user from eligible users
    const removeEligibleUser = (userId: string) => {
        setEligibleUserIds((prev) => prev.filter((id) => id !== userId))
    }

    // Get user by ID
    const getUserById = (userId: string) => {
        return users.find((user) => user._id === userId)
    }

    // Add coupon handler
    const handleAddCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            const couponData = {
                code: formData.get("code"),
                discountType: formData.get("discountType"),
                discountValue: Number(formData.get("discountValue")),
                minPurchase: Number(formData.get("minPurchase")),
                maxPurchase: formData.get("maxPurchase") ? Number(formData.get("maxPurchase")) : undefined,
                totalCoupons: Number(formData.get("totalCoupons")),
                maxUsesPerUser: Number(formData.get("maxUsesPerUser")),
                startAt: formData.get("startAt"),
                expiresAt: formData.get("expiresAt"),
                eligibleUsers: eligibleUserIds.length > 0 ? eligibleUserIds : undefined,
            }

            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/coupons`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(couponData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to add coupon")
            }

            setIsAddDialogOpen(false)
            setCoupons(data.data || [])
            toast({
                title: "Success",
                description: "Coupon added successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add coupon",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Edit coupon handler
    const handleEditCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!currentCoupon) return

        setIsLoading(true)
        try {
            const formData = new FormData(event.currentTarget)

            // Check for valid dates
            const startAt = formData.get("startAt") as string
            const expiresAt = formData.get("expiresAt") as string

            if (!isValidDate(startAt) || !isValidDate(expiresAt)) {
                throw new Error("Please enter valid dates")
            }

            const couponData = {
                discountValue: Number(formData.get("discountValue")),
                minPurchase: Number(formData.get("minPurchase")),
                maxPurchase: formData.get("maxPurchase") ? Number(formData.get("maxPurchase")) : undefined,
                maxUsesPerUser: Number(formData.get("maxUsesPerUser")),
                startAt: startAt,
                expiresAt: expiresAt,
                isActive: formData.get("isActive") === "true",
                totalCoupons: Number(formData.get("totalCoupons")),
                eligibleUsers: eligibleUserIds,
            }

            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/coupons/${currentCoupon.code}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(couponData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to update coupon")
            }

            setIsEditDialogOpen(false)
            setCoupons(data.data)
            toast({
                title: "Success",
                description: "Coupon updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update coupon",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Delete coupon handler
    const handleDeleteCoupon = async (code: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return

        setIsLoading(true)
        try {
            const token = localStorage.getItem("accessToken")

            const response = await fetch(`${API_URL}/api/coupons/${code}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete coupon")
            }

            setCoupons(data.data)
            toast({
                title: "Success",
                description: "Coupon deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete coupon",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // User selection component
    const UserSelectionSection = () => (
        <div className="space-y-4">
            <Label>Eligible Users</Label>

            <Card>
                <CardContent className="p-4">
                    <Tabs defaultValue="email" onValueChange={(value) => setContactType(value as "email" | "phone")}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email">Email Users</TabsTrigger>
                            <TabsTrigger value="phone">Phone Users</TabsTrigger>
                        </TabsList>
                        <TabsContent value="email" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addSelectedUsersToEligible} disabled={selectedUserIds.length === 0}>
                                        Add Selected
                                    </Button>
                                </div>
                                <ScrollArea className="h-[150px] border rounded-md p-2">
                                    <div className="space-y-2">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-4">No users found</p>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <div key={user._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                    <Checkbox
                                                        id={`user-${user._id}`}
                                                        checked={selectedUserIds.includes(user._id)}
                                                        onCheckedChange={() => toggleUserSelection(user._id)}
                                                    />
                                                    <Label htmlFor={`user-${user._id}`} className="flex-1 cursor-pointer">
                                                        <div>{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                        <TabsContent value="phone" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search users by name or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addSelectedUsersToEligible} disabled={selectedUserIds.length === 0}>
                                        Add Selected
                                    </Button>
                                </div>
                                <ScrollArea className="h-[150px] border rounded-md p-2">
                                    <div className="space-y-2">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-4">No users found</p>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <div key={user._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                    <Checkbox
                                                        id={`user-${user._id}`}
                                                        checked={selectedUserIds.includes(user._id)}
                                                        onCheckedChange={() => toggleUserSelection(user._id)}
                                                    />
                                                    <Label htmlFor={`user-${user._id}`} className="flex-1 cursor-pointer">
                                                        <div>{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Selected eligible users */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label>Selected Eligible Users</Label>
                    {eligibleUserIds.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setEligibleUserIds([])}>
                            Clear All
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="p-4">
                        {eligibleUserIds.length === 0 ? (
                            <p className="text-center text-muted-foreground py-2">All users are eligible</p>
                        ) : (
                            <ScrollArea className="h-[100px]">
                                <div className="flex flex-wrap gap-2">
                                    {eligibleUserIds.map((userId) => {
                                        const user = getUserById(userId)
                                        return user ? (
                                            <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                                {user.name}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                                    onClick={() => removeEligibleUser(userId)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ) : null
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    if (isLoading && coupons.length === 0) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Coupons</h1>
                    <p className="text-muted-foreground">Manage your discount coupons</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Add New Coupon</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="code">Code</Label>
                                    <Input id="code" name="code" required className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="discountType">Discount Type</Label>
                                    <Select name="discountType" defaultValue="percentage">
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="discountValue">Discount Value</Label>
                                    <Input
                                        id="discountValue"
                                        name="discountValue"
                                        type="number"
                                        step="0.01"
                                        required
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="minPurchase">Minimum Purchase</Label>
                                    <Input
                                        id="minPurchase"
                                        name="minPurchase"
                                        type="number"
                                        step="0.01"
                                        defaultValue="0"
                                        required
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxPurchase">Maximum Purchase</Label>
                                    <Input id="maxPurchase" name="maxPurchase" type="number" step="0.01" className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                                    <Input
                                        id="maxUsesPerUser"
                                        name="maxUsesPerUser"
                                        type="number"
                                        defaultValue="1"
                                        required
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="totalCoupons">Total Coupons</Label>
                                    <Input id="totalCoupons" name="totalCoupons" type="number" required className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="startAt">Live Date</Label>
                                    <Input
                                        id="startAt"
                                        name="startAt"
                                        type="datetime-local"
                                        defaultValue={new Date().toISOString().slice(0, 16)}
                                        required
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expiresAt">Expiry Date</Label>
                                    <Input id="expiresAt" name="expiresAt" type="datetime-local" required className="mt-1.5" />
                                </div>
                            </div>

                            <UserSelectionSection />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Adding..." : "Add Coupon"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="h-[500px] w-[350px] md:w-full rounded-md border p-4">
                <div className="rounded-lg border bg-card overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Purchase Range</TableHead>
                                <TableHead>Eligible Users</TableHead>
                                <TableHead>Usage Stats</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                        No coupons found. Create your first coupon.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon._id}>
                                        <TableCell className="font-medium">{coupon.code}</TableCell>
                                        <TableCell>
                                            {coupon.discountValue}
                                            {coupon.discountType === "percentage" ? "%" : " Rs"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>Min: {coupon.minPurchase} Rs</div>
                                                <div>Max: {coupon.maxPurchase ? `${coupon.maxPurchase} Rs` : "No limit"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.eligibleUsers && coupon.eligibleUsers.length > 0 ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            {coupon.eligibleUsers.length} users
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Eligible Users</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="h-[300px]">
                                                            <div className="space-y-2">
                                                                {coupon.eligibleUsers.map((userId) => {
                                                                    const user = getUserById(userId)
                                                                    return user ? (
                                                                        <div key={userId} className="p-2 border rounded-md">
                                                                            <div className="font-medium">{user.name}</div>
                                                                            {user.email && <div className="text-sm">{user.email}</div>}
                                                                            {user.phone && <div className="text-sm">{user.phone}</div>}
                                                                        </div>
                                                                    ) : (
                                                                        <div key={userId} className="p-2 border rounded-md text-muted-foreground">
                                                                            Unknown User (ID: {userId})
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Badge variant="outline">All users</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    Total Usage: {coupon.usedCoupons}/{coupon.totalCoupons}
                                                    <Progress value={(coupon.usedCoupons / coupon.totalCoupons) * 100} className="h-2 mt-1" />
                                                </div>
                                                <div className="text-sm">Per User: {coupon.maxUsesPerUser}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>Live: {new Date(coupon.startAt).toLocaleDateString()}</div>
                                                <div>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog
                                                    open={isEditDialogOpen && currentCoupon?._id === coupon._id}
                                                    onOpenChange={(open) => {
                                                        setIsEditDialogOpen(open)
                                                        if (!open) setCurrentCoupon(null)
                                                    }}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setCurrentCoupon(coupon)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Coupon: {coupon.code}</DialogTitle>
                                                        </DialogHeader>
                                                        {currentCoupon && (
                                                            <form onSubmit={handleEditCoupon} className="space-y-4">
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-discountValue">Discount Value</Label>
                                                                        <Input
                                                                            id="edit-discountValue"
                                                                            name="discountValue"
                                                                            type="number"
                                                                            step="0.01"
                                                                            defaultValue={currentCoupon.discountValue}
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-minPurchase">Minimum Purchase</Label>
                                                                        <Input
                                                                            id="edit-minPurchase"
                                                                            name="minPurchase"
                                                                            type="number"
                                                                            step="0.01"
                                                                            defaultValue={currentCoupon.minPurchase}
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-maxPurchase">Maximum Purchase</Label>
                                                                        <Input
                                                                            id="edit-maxPurchase"
                                                                            name="maxPurchase"
                                                                            type="number"
                                                                            step="0.01"
                                                                            defaultValue={currentCoupon.maxPurchase}
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-maxUsesPerUser">Max Uses Per User</Label>
                                                                        <Input
                                                                            id="edit-maxUsesPerUser"
                                                                            name="maxUsesPerUser"
                                                                            type="number"
                                                                            defaultValue={currentCoupon.maxUsesPerUser}
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-totalCoupons">Total Coupons</Label>
                                                                        <Input
                                                                            id="edit-totalCoupons"
                                                                            name="totalCoupons"
                                                                            type="number"
                                                                            defaultValue={currentCoupon.totalCoupons}
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-isActive">Status</Label>
                                                                        <Select name="isActive" defaultValue={currentCoupon.isActive ? "true" : "false"}>
                                                                            <SelectTrigger className="mt-1.5">
                                                                                <SelectValue placeholder="Select status" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="true">Active</SelectItem>
                                                                                <SelectItem value="false">Inactive</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-startAt">Live Date</Label>
                                                                        <Input
                                                                            id="edit-startAt"
                                                                            name="startAt"
                                                                            type="datetime-local"
                                                                            defaultValue={
                                                                                currentCoupon.startAt
                                                                                    ? new Date(currentCoupon.startAt).toISOString().slice(0, 16)
                                                                                    : ""
                                                                            }
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-expiresAt">Expiry Date</Label>
                                                                        <Input
                                                                            id="edit-expiresAt"
                                                                            name="expiresAt"
                                                                            type="datetime-local"
                                                                            defaultValue={
                                                                                currentCoupon.expiresAt
                                                                                    ? new Date(currentCoupon.expiresAt).toISOString().slice(0, 16)
                                                                                    : ""
                                                                            }
                                                                            required
                                                                            className="mt-1.5"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <UserSelectionSection />

                                                                <Button type="submit" className="w-full" disabled={isLoading}>
                                                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                    {isLoading ? "Updating..." : "Update Coupon"}
                                                                </Button>
                                                            </form>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleDeleteCoupon(coupon.code)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}

