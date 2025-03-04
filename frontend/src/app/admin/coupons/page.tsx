"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

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
}

function isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
}

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const fetchCoupons = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/coupons/all`, {
                credentials: "include",
            });
            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "No coupon found",
                    variant: "destructive",
                });
            }

            setCoupons(data.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch coupons",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // ✅ Empty dependency array ensures function reference remains stable.

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]); // ✅ Added `fetchCoupons` to the dependency array.

    const handleAddCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/coupons`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.fromEntries(formData)),
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to add coupon",
                    variant: "destructive",
                })
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

    const handleEditCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!currentCoupon) return
        const form = event.currentTarget
        const formData = new FormData(form)

        // Check for valid dates
        const liveAt = formData.get("startAt") as string
        const expiresAt = formData.get("expiresAt") as string
        if (!isValidDate(liveAt) || !isValidDate(expiresAt)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter valid dates",
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/coupons/${currentCoupon.code}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.fromEntries(formData)),
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to update coupon",
                    variant: "destructive",
                })
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

    const handleDeleteCoupon = async (code: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/coupons/${code}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to delete coupon",
                    variant: "destructive",
                })
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

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 ">
            <div className="flex justify-between items-center mb-6  ">
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
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Coupon</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCoupon} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Code</Label>
                                    <Input id="code" name="code" required className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="discountType">Discount Type</Label>
                                    <Select name="discountType">
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                                    <Input id="maxUsesPerUser" name="maxUsesPerUser" type="number" required className="mt-1.5" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="minPurchase">Minimum Purchase</Label>
                                    <Input id="minPurchase" name="minPurchase" type="number" step="0.01" required className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="maxPurchase">Maximum Purchase</Label>
                                    <Input id="maxPurchase" name="maxPurchase" type="number" step="0.01" className="mt-1.5" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startAt">Live Date</Label>
                                    <Input id="startAt" name="startAt" type="datetime-local" required className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="expiresAt">Expiry Date</Label>
                                    <Input id="expiresAt" name="expiresAt" type="datetime-local" required className="mt-1.5" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="totalCoupons">Total Coupons</Label>
                                <Input id="totalCoupons" name="totalCoupons" type="number" required className="mt-1.5" />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Adding..." : "Add Coupon"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <ScrollArea className="h-[400px] w-[350px] md:w-full rounded-md border p-4">

                <div className="rounded-lg border bg-card overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Purchase Range</TableHead>
                                <TableHead>Usage Stats</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons?.map((coupon) => (
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
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Coupon</DialogTitle>
                                                    </DialogHeader>
                                                    {currentCoupon && (
                                                        <form onSubmit={handleEditCoupon} className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
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
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
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

                                                            <Button type="submit" className="w-full" disabled={isLoading}>
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
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}

