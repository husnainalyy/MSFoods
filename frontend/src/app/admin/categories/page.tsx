"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authFetch, createAuthHeaders } from "@/app/utils/auth-helpers"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SettingsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [settings, setSettings] = useState<Settings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isEditShippingDialogOpen, setIsEditShippingDialogOpen] = useState(false)
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
    const [newCategory, setNewCategory] = useState({ name: "", description: "", isActive: true })
    const [newShippingFee, setNewShippingFee] = useState(0)
    const { toast } = useToast()

    const fetchCategories = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/categories`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error("Failed to fetch categories")
            }

            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch categories",
            })
        }
    }, [toast])

    const fetchSettings = useCallback(async () => {
        try {
            const response = await authFetch(`${API_URL}/api/settings`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error("Failed to fetch settings")
            }

            setSettings(data)
            setNewShippingFee(data.shippingFee)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch settings",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchCategories()
        fetchSettings()
    }, [fetchCategories, fetchSettings])

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        setIsLoading(true)
        try {
            const response = await authFetch(`${API_URL}/api/categories/${categoryId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete category")
            }

            fetchCategories()
            toast({
                title: "Success",
                description: "Category deleted successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                method: "POST",
                headers: createAuthHeaders(),
                body: JSON.stringify(newCategory),
            })

            if (!response.ok) {
                throw new Error("Failed to add category")
            }

            fetchCategories()
            setIsAddCategoryDialogOpen(false)
            setNewCategory({ name: "", description: "", isActive: true })
            toast({
                title: "Success",
                description: "Category added successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentCategory) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/categories/${currentCategory._id}`, {
                method: "PUT",
                headers: createAuthHeaders(),
                body: JSON.stringify(currentCategory),
            })

            if (!response.ok) {
                throw new Error("Failed to update category")
            }

            fetchCategories()
            setIsEditCategoryDialogOpen(false)
            setCurrentCategory(null)
            toast({
                title: "Success",
                description: "Category updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update category",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateShipping = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) return

        setIsLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                method: "PUT",
                headers: createAuthHeaders(),
                body: JSON.stringify({ shippingFee: newShippingFee }),
            })

            if (!response.ok) {
                throw new Error("Failed to update shipping fee")
            }

            fetchSettings()
            setIsEditShippingDialogOpen(false)
            toast({
                title: "Success",
                description: "Shipping fee updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update shipping fee",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (isLoading && !categories.length && !settings) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {settings ? (
                        <div className="flex items-center gap-4">
                            <p className="text-lg">Current Shipping Fee: Rs {settings.shippingFee.toFixed(2)}</p>
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
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                                </>
                                            ) : (
                                                "Update"
                                            )}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <p>No shipping settings found. Please create shipping settings.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Categories</CardTitle>
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
                                        required
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
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                        </>
                                    ) : (
                                        "Add Category"
                                    )}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category._id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentCategory(category)
                                                        setIsEditCategoryDialogOpen(true)
                                                    }}
                                                    className="mr-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

