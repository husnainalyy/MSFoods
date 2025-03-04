"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Category {
    _id: string
    name: string
    description: string
    isActive: boolean
}

interface Settings {
    _id: string
    shippingFee: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommercepeachflask-git-main-husnain-alis-projects-dbd16c4d.vercel.app"

export default function StoreSettings() {
    const [categories, setCategories] = useState<Category[]>([])
    const [settings, setSettings] = useState<Settings | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isEditShippingDialogOpen, setIsEditShippingDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
    const [newCategory, setNewCategory] = useState({ name: "", description: "", isActive: true })
    const [newShippingFee, setNewShippingFee] = useState(0)
    const { toast } = useToast()

    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to fetch categories",
                    variant: "destructive",
                })
            }

            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch categories",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                credentials: "include",
            })
            const data = await response.json()

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to fetch shipping",
                    variant: "destructive",
                })
            }

            setSettings(data)
            setNewShippingFee(data.shippingFee)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch settings",
            })
        }
    }, [toast])

    useEffect(() => {
        fetchCategories()
        fetchSettings()
    }, [fetchCategories, fetchSettings]) // ✅ Dependencies added

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (response.ok) {
                fetchCategories()
                toast({
                    title: "Success",
                    description: "Category deleted successfully",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete category",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete category",
            })
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(newCategory),
            })
            if (response.ok) {
                fetchCategories()
                setIsAddCategoryDialogOpen(false)
                setNewCategory({ name: "", description: "", isActive: true })
                toast({
                    title: "Success",
                    description: "Category added successfully",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add category",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add category",
            })
        }
    }

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentCategory) return
        try {
            const response = await fetch(`${API_URL}/api/categories/${currentCategory._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(currentCategory),
            })
            if (response.ok) {
                fetchCategories()
                setIsEditCategoryDialogOpen(false)
                setCurrentCategory(null)
                toast({
                    title: "Success",
                    description: "Category updated successfully",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update category",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update category",
            })
        }
    }

    const handleUpdateShipping = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) return
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ ...settings, shippingFee: newShippingFee }),
            })
            if (response.ok) {
                fetchSettings()
                setIsEditShippingDialogOpen(false)
                toast({
                    title: "Success",
                    description: "Shipping fee updated successfully",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update shipping fee",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update shipping fee",
            })
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Store Settings</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Shipping</h2>
                {settings ? (
                    <div className="flex items-center gap-4">
                        <p className="text-lg">
                            Current Shipping Fee: Rs {settings.shippingFee ? settings.shippingFee.toFixed(2) : "N/A"}
                        </p>
                        <Dialog open={isEditShippingDialogOpen} onOpenChange={setIsEditShippingDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Update Shipping Fee</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Shipping Fee</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateShipping} className="space-y-4">
                                    <div>
                                        <Label htmlFor="shippingFee">New Shipping Fee (Rs)</Label>
                                        <Input
                                            id="shippingFee"
                                            type="number"
                                            value={newShippingFee}
                                            onChange={(e) => setNewShippingFee(Number(e.target.value))}
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <Button type="submit">Update</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <p>Loading shipping information...</p>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Categories</h2>
                <div className="mb-4 flex justify-between items-center">
                    <Input className="max-w-sm" placeholder="Search categories..." />
                    <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Category</Button>
                        </DialogTrigger>
                        <DialogContent>                    
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={newCategory.isActive}
                                        onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                                <Button type="submit">Add Category</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : (
                            Array.isArray(categories) && categories.length > 0 ? (
                                categories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>{category.description}</TableCell>
                                        <TableCell>{category.isActive ? "Active" : "Inactive"}</TableCell>
                                        <TableCell>
                                            <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="mr-2"
                                                        onClick={() => setCurrentCategory(category)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Category</DialogTitle>
                                                    </DialogHeader>
                                                    {currentCategory && (
                                                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="editName">Name</Label>
                                                                <Input
                                                                    id="editName"
                                                                    value={currentCategory.name}
                                                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="editDescription">Description</Label>
                                                                <Input
                                                                    id="editDescription"
                                                                    value={currentCategory.description}
                                                                    onChange={(e) =>
                                                                        setCurrentCategory({ ...currentCategory, description: e.target.value })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    id="editIsActive"
                                                                    checked={currentCategory.isActive}
                                                                    onCheckedChange={(checked) =>
                                                                        setCurrentCategory({ ...currentCategory, isActive: checked })
                                                                    }
                                                                />
                                                                <Label htmlFor="editIsActive">Active</Label>
                                                            </div>
                                                            <Button type="submit">Update Category</Button>
                                                        </form>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="outline" size="icon" onClick={() => handleDeleteCategory(category._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}